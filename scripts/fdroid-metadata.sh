#!/usr/bin/env bash
# Keep metadata/de.helpwave.appzumdoc.yml in sync with apps/mobile/build-metadata.json.
#
#   scripts/fdroid-metadata.sh apply                    write versionName/versionCode in place
#   scripts/fdroid-metadata.sh check                    exit 1 if apply would change the file
#   scripts/fdroid-metadata.sh render <commit> <out>    like apply, plus the build commit, into <out>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ROOT}/metadata/de.helpwave.appzumdoc.yml"
SYNC="${ROOT}/scripts/mobile-sync.sh"

die() { echo "error: $*" >&2; exit 1; }

render() {
  local commit="$1" out="$2" version code
  version="$("${SYNC}" get version)"
  code="$("${SYNC}" get code)"
  sed -e "s/^\(  - versionName:\).*/\1 ${version}/" \
      -e "s/^\(    versionCode:\).*/\1 ${code}/" \
      -e "s/^CurrentVersion:.*/CurrentVersion: ${version}/" \
      -e "s/^CurrentVersionCode:.*/CurrentVersionCode: ${code}/" \
      ${commit:+-e "s/^\(    commit:\).*/\1 ${commit}/"} \
      "${SRC}" > "${out}"
}

case "${1:-}" in
  render)
    [[ "${2:-}" =~ ^[0-9a-f]{40}$ && -n "${3:-}" ]] || die "usage: $0 render <full commit hash> <out>"
    render "$2" "$3"
    ;;
  apply)
    tmp="$(mktemp)"
    render "" "${tmp}"
    mv "${tmp}" "${SRC}"
    ;;
  check)
    tmp="$(mktemp)"
    render "" "${tmp}"
    diff -u "${SRC}" "${tmp}" || die "${SRC} is out of sync. Run: scripts/mobile-sync.sh apply"
    rm -f "${tmp}"
    ;;
  *)
    sed -n '2,6p' "$0"; exit 1 ;;
esac
