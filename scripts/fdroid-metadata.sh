#!/usr/bin/env bash
# Render metadata/de.helpwave.appzumdoc.yml (the fdroiddata recipe) from
# apps/mobile/build-metadata.json.
#
#   scripts/mobile-sync.sh apply                     rewrite metadata/<appid>.yml via this script
#   scripts/fdroid-metadata.sh apply                 rewrite metadata/<appid>.yml in place for the current version
#   scripts/fdroid-metadata.sh render <tag> <out>    render for <tag> (android@x.y.z) into <out>
#   scripts/fdroid-metadata.sh check                 exit 1 if metadata/<appid>.yml differs from `apply`
#
# Sources of truth:
#   version, versionCode      build-metadata.json version  (via scripts/mobile-sync.sh)
#   pnpm version              build-metadata.json pnpm
#   Node release + sha256     build-metadata.json fdroid.node  (sha fetched from nodejs.org)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPID="de.helpwave.appzumdoc"
SRC="${ROOT}/metadata/${APPID}.yml"
SYNC="${ROOT}/scripts/mobile-sync.sh"

die() { echo "error: $*" >&2; exit 1; }
[[ -f "${SRC}" ]] || die "not found: ${SRC}"
[[ -x "${SYNC}" ]] || chmod +x "${SYNC}"
command -v node >/dev/null || die "node is required"
command -v curl >/dev/null || die "curl is required"

write_recipe() {
  local src="$1" dest="$2"
  RECIPE_SRC="${src}" RECIPE_DEST="${dest}" \
  RECIPE_VERSION="${3}" RECIPE_CODE="${4}" RECIPE_TAG="${5}" \
  RECIPE_NODE="${6}" RECIPE_SHA="${7}" RECIPE_PNPM="${8}" \
    node -e '
      const fs = require("fs");
      const {
        RECIPE_SRC: src, RECIPE_DEST: dest, RECIPE_VERSION: version,
        RECIPE_CODE: code, RECIPE_TAG: tag, RECIPE_NODE: nodeVer,
        RECIPE_SHA: sha, RECIPE_PNPM: pnpm,
      } = process.env;
      const text = fs.readFileSync(src, "utf8");
      const nl = text.endsWith("\n");
      const lines = text.replace(/\n$/, "").split("\n").map((line) => {
        if (/^\s+-?\s*versionName:/.test(line)) return line.replace(/^(\s+-?\s*versionName:\s*).*$/, `$1${version}`);
        if (/^\s+-?\s*versionCode:/.test(line)) return line.replace(/^(\s+-?\s*versionCode:\s*).*$/, `$1${code}`);
        if (/^\s+-?\s*commit:/.test(line)) return line.replace(/^(\s+-?\s*commit:\s*).*$/, `$1${tag}`);
        if (/nodejs\.org|node-v\d|node\.tar\.xz/.test(line)) {
          line = line.replace(/v\d+\.\d+\.\d+/g, `v${nodeVer}`);
        }
        if (/node\.tar\.xz|sha256sum|__NODE_SHA256__/.test(line)) {
          line = line.replace(/__NODE_SHA256__|[0-9a-f]{64}/g, sha);
        }
        if (/pnpm@\d+\.\d+\.\d+/.test(line)) {
          line = line.replace(/pnpm@\d+\.\d+\.\d+/g, `pnpm@${pnpm}`);
        }
        if (/^CurrentVersion:/.test(line)) return `CurrentVersion: ${version}`;
        if (/^CurrentVersionCode:/.test(line)) return `CurrentVersionCode: ${code}`;
        return line;
      });
      fs.writeFileSync(dest, lines.join("\n") + (nl ? "\n" : ""));
    '
}

render() {
  local tag="$1" out="$2" version code pnpm node sha

  version="$("${SYNC}" store-version "${tag}")"
  code="$("${SYNC}" get code)"
  [[ "${version}" == "$("${SYNC}" get version)" ]] \
    || die "tag '${tag}' says ${version} but build-metadata.json says $("${SYNC}" get version)"

  pnpm="$("${SYNC}" get pnpm)"
  node="$("${SYNC}" get fdroid.node)"
  [[ "${node}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "fdroid.node in build-metadata.json must be a full x.y.z Node release (got '${node}')"

  sha="$(curl -fsSL "https://nodejs.org/dist/v${node}/SHASUMS256.txt" \
    | awk -v f="node-v${node}-linux-x64.tar.xz" '$2==f {print $1}')"
  [[ "${sha}" =~ ^[0-9a-f]{64}$ ]] || die "could not resolve sha256 for node v${node} linux-x64"

  write_recipe "${SRC}" "${out}" "${version}" "${code}" "${tag}" "${node}" "${sha}" "${pnpm}"

  echo "rendered ${out}: ${APPID} ${version} (${code}) @ ${tag}, node v${node}, pnpm ${pnpm}"
}

case "${1:-}" in
  render)
    [[ -n "${2:-}" && -n "${3:-}" ]] || die "usage: $0 render <tag> <out>"
    render "$2" "$3"
    ;;
  apply)
    tmp="$(mktemp)"
    render "android@$("${SYNC}" get version)" "${tmp}"
    mv "${tmp}" "${SRC}"
    echo "updated ${SRC}"
    ;;
  check)
    tmp="$(mktemp)"
    render "android@$("${SYNC}" get version)" "${tmp}" >/dev/null
    if diff -u "${SRC}" "${tmp}"; then
      echo "OK: ${SRC} is in sync with build-metadata.json"
    else
      rm -f "${tmp}"
      die "${SRC} is out of sync. Run: scripts/mobile-sync.sh apply"
    fi
    rm -f "${tmp}"
    ;;
  *)
    sed -n '2,12p' "$0"; exit 1 ;;
esac
