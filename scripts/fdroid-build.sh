#!/usr/bin/env bash
# Build metadata/de.helpwave.appzumdoc.yml the way fdroiddata CI does.
# Runs as root inside registry.gitlab.com/fdroid/fdroidserver:buildserver-trixie.
#
#   scripts/fdroid-build.sh <commit> <out-dir>
set -euo pipefail

APPID="de.helpwave.appzumdoc"
FDROIDSERVER_REF="c21c177ff6d813697aaf9c988ca9fbb2b571b468"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMIT="${1:?usage: $0 <commit> <out-dir>}"
OUT="$(mkdir -p "${2:?usage: $0 <commit> <out-dir>}" && cd "$2" && pwd)"

source /etc/profile.d/bsenv.sh

retry() {
  local n
  for n in 1 2 3 4; do
    "$@" && return
    echo "attempt ${n} failed: $*" >&2
    sleep $((n * 15))
  done
  return 1
}

retry git clone -q --filter=blob:none https://gitlab.com/fdroid/fdroidserver.git "${fdroidserver}"
git -C "${fdroidserver}" checkout -q "${FDROIDSERVER_REF}"
retry git -C "${home_vagrant}/gradlew-fdroid" pull -q
retry git clone -q --depth 1 --filter=blob:none --sparse https://gitlab.com/fdroid/fdroiddata.git /tmp/fdroiddata
git -C /tmp/fdroiddata sparse-checkout set config

cd "${home_vagrant}"
cp -r /tmp/fdroiddata/config .
mkdir -p metadata tmp unsigned .android .gradle
cp "${ROOT}/metadata/${APPID}.yml" metadata/
chown -R vagrant "${home_vagrant}"
git config --system --add safe.directory '*'
git -C "${ROOT}" update-ref refs/heads/fdroid-build "${COMMIT}"
sysctl fs.inotify.max_user_watches=524288 || true

fdroid() {
  sudo --preserve-env --user vagrant env PATH="${fdroidserver}:${PATH}" \
    PYTHONPATH="${fdroidserver}:${fdroidserver}/examples" PYTHONUNBUFFERED=true \
    HOME="${home_vagrant}" GRADLE_USER_HOME="${home_vagrant}/.gradle" "${fdroidserver}/fdroid" "$@"
}

fdroid lint "${APPID}"
fdroid rewritemeta "${APPID}"
diff -u "${ROOT}/metadata/${APPID}.yml" "metadata/${APPID}.yml"

sed -i -e "s|^Repo: .*|Repo: ${ROOT}|" -e '/^Binaries:/,/^$/d' -e "s|^    commit: .*|    commit: ${COMMIT}|" \
  "metadata/${APPID}.yml"
CODE="$(sed -n 's/^CurrentVersionCode: //p' "metadata/${APPID}.yml")"
fdroid fetch_repo "${APPID}:${CODE}"
(unset CI; fdroid build --verbose --test --on-server --no-tarball "${APPID}:${CODE}")

cp tmp/"${APPID}"_*.apk "${OUT}/"
