#!/usr/bin/env bash

set -euo pipefail

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
command -v gh >/dev/null || die "gh is required"
command -v jq >/dev/null || die "jq is required"

list_runs() {
  gh run list \
    --repo "${repo}" \
    --workflow "${workflow}" \
    --commit "${sha}" \
    --limit 20 \
    --json databaseId,status,conclusion,createdAt
}

while (( SECONDS < deadline )); do
  json="$(list_runs)"
  success="$(jq -r '[.[] | select(.status == "completed" and .conclusion == "success")] | sort_by(.createdAt) | reverse | .[0].databaseId // empty' <<< "${json}")"
  if [[ -n "${success}" ]]; then
    echo "Using successful '${workflow}' run ${success} for ${sha}" >&2
    echo "${success}"
    exit 0
  fi

  inflight="$(jq -r '[.[] | select(.status != "completed")] | sort_by(.createdAt) | reverse | .[0] // empty' <<< "${json}")"
  if [[ -n "${inflight}" ]]; then
    run_id="$(jq -r '.databaseId' <<< "${inflight}")"
    run_status="$(jq -r '.status' <<< "${inflight}")"
    echo "'${workflow}' run ${run_id} is ${run_status}; waiting ${interval}s" >&2
    sleep "${interval}"
    continue
  fi

  failed="$(jq -r '[.[] | select(.status == "completed")] | sort_by(.createdAt) | reverse | .[0] // empty' <<< "${json}")"
  if [[ -n "${failed}" ]]; then
    run_id="$(jq -r '.databaseId' <<< "${failed}")"
    conclusion="$(jq -r '.conclusion' <<< "${failed}")"
    die "'${workflow}' run ${run_id} finished with ${conclusion} for ${sha}"
  fi

  if (( SECONDS >= appear_deadline )); then
    die "No '${workflow}' run found for ${sha}"
  fi
  echo "No '${workflow}' run for ${sha} yet; waiting ${interval}s" >&2
  sleep "${interval}"
done

die "Timed out waiting for '${workflow}' on ${sha}"
