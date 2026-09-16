#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SYNC="${ROOT}/scripts/mobile-sync.sh"

workflow="${1:-}"
repo="${GITHUB_REPOSITORY:-}"
sha="${GITHUB_SHA:-}"
deadline=$((SECONDS + 7200))
appear_deadline=$((SECONDS + 900))
interval=30

die() { echo "error: $*" >&2; exit 1; }

[[ -n "${workflow}" ]] || die "usage: scripts/mobile-wait-build.sh <workflow name>"
[[ -n "${repo}" ]] || die "GITHUB_REPOSITORY is required"
[[ -n "${sha}" ]] || die "GITHUB_SHA is required"
[[ -f "${SYNC}" ]] || die "not found: ${SYNC}"
[[ -x "${SYNC}" ]] || chmod +x "${SYNC}"
command -v gh >/dev/null || die "gh is required"
command -v jq >/dev/null || die "jq is required"

want_version="$("${SYNC}" get version)"
[[ -n "${want_version}" ]] || die "could not read version from build-metadata.json"

version_cache="$(mktemp -d)"
trap 'rm -rf "${version_cache}"' EXIT

list_runs_for_sha() {
  gh run list \
    --repo "${repo}" \
    --workflow "${workflow}" \
    --commit "${sha}" \
    --limit 20 \
    --json databaseId,status,conclusion,createdAt
}

list_successful() {
  gh run list \
    --repo "${repo}" \
    --workflow "${workflow}" \
    --status success \
    --limit 50 \
    --json databaseId,headSha,createdAt
}

version_at_sha() {
  local commit="$1" cached cache_file="${version_cache}/${commit}"
  if [[ -f "${cache_file}" ]]; then
    cat "${cache_file}"
    return 0
  fi
  cached="$(
    gh api \
      -H "Accept: application/vnd.github.raw" \
      "repos/${repo}/contents/apps/mobile/build-metadata.json?ref=${commit}" \
      --jq '.version // empty' 2>/dev/null || true
  )"
  printf '%s' "${cached}" > "${cache_file}"
  printf '%s' "${cached}"
}

pick_success_for_sha() {
  jq -r '[.[] | select(.status == "completed" and .conclusion == "success")] | sort_by(.createdAt) | reverse | .[0].databaseId // empty' <<< "$1"
}

pick_inflight() {
  jq -r '[.[] | select(.status != "completed")] | sort_by(.createdAt) | reverse | .[0] // empty' <<< "$1"
}

pick_completed() {
  jq -r '[.[] | select(.status == "completed")] | sort_by(.createdAt) | reverse | .[0] // empty' <<< "$1"
}

pick_success_for_version() {
  local json="$1" id commit ver
  while IFS=$'\t' read -r id commit; do
    [[ -n "${id}" && -n "${commit}" ]] || continue
    ver="$(version_at_sha "${commit}")"
    if [[ "${ver}" == "${want_version}" ]]; then
      printf '%s' "${id}"
      return 0
    fi
  done < <(jq -r 'sort_by(.createdAt) | reverse | .[] | "\(.databaseId)\t\(.headSha)"' <<< "${json}")
  return 1
}

use_run() {
  echo "$1"
  exit 0
}

while (( SECONDS < deadline )); do
  json="$(list_runs_for_sha)"
  success="$(pick_success_for_sha "${json}")"
  if [[ -n "${success}" ]]; then
    echo "Using successful '${workflow}' run ${success} for ${sha}" >&2
    use_run "${success}"
  fi

  inflight="$(pick_inflight "${json}")"
  if [[ -n "${inflight}" ]]; then
    run_id="$(jq -r '.databaseId' <<< "${inflight}")"
    run_status="$(jq -r '.status' <<< "${inflight}")"
    echo "'${workflow}' run ${run_id} is ${run_status}; waiting ${interval}s" >&2
    sleep "${interval}"
    continue
  fi

  fallback="$(pick_success_for_version "$(list_successful)")" || fallback=""
  if [[ -n "${fallback}" ]]; then
    echo "No '${workflow}' run for ${sha}; using last successful run ${fallback} for version ${want_version}" >&2
    use_run "${fallback}"
  fi

  failed="$(pick_completed "${json}")"
  if [[ -n "${failed}" ]]; then
    run_id="$(jq -r '.databaseId' <<< "${failed}")"
    conclusion="$(jq -r '.conclusion' <<< "${failed}")"
    die "'${workflow}' run ${run_id} finished with ${conclusion} for ${sha} and no successful '${workflow}' run exists for version ${want_version}"
  fi

  if (( SECONDS >= appear_deadline )); then
    die "No '${workflow}' run for ${sha} and no successful run for version ${want_version}"
  fi
  echo "No '${workflow}' run for ${sha} yet and no successful run for version ${want_version}; waiting ${interval}s" >&2
  sleep "${interval}"
done

die "Timed out waiting for '${workflow}' on ${sha} or version ${want_version}"
