#!/usr/bin/env bash

set -euo pipefail
shopt -s inherit_errexit 2>/dev/null || true

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
META="${ROOT}/apps/mobile/build-metadata.json"
APP_JSON="${ROOT}/apps/mobile/app.json"
PKG_JSON="${ROOT}/apps/mobile/package.json"
WORKFLOW_DIR="${ROOT}/.github/workflows"
PLATFORMS=(ios android)

die() { echo "error: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
scripts/mobile-sync.sh apply            write derived values into app.json, package.json, workflows
scripts/mobile-sync.sh check            exit 1 if any derived file differs from apply
scripts/mobile-sync.sh version x.y.z    set version in build-metadata.json, then apply
scripts/mobile-sync.sh check-tag <tag>  exit 1 unless <tag> (ios@x.y.z / android@x.y.z) matches metadata version
scripts/mobile-sync.sh tag [ios|android|all] [--push]
                                        create ios@<ver> / android@<ver> tags from metadata version
scripts/mobile-sync.sh get <key>        print one value, e.g. get version, get appVersion, get ios.xcode, get android.sdkPackages
EOF
  exit "${1:-0}"
}

[[ -f "${META}" ]] || die "not found: ${META}"

require_semver() { [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "'$1' is not a plain x.y.z version"; }

resolve_key() {
  node -e '
    const m = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    const key = process.argv[2];
    function fail(msg) { console.error("error: " + msg); process.exit(1); }
    function sdkPackages() {
      const compile = m.android && m.android.compileSdkVersion;
      const tools = m.android && m.android.buildToolsVersion;
      if (compile == null || tools == null) {
        fail("android.compileSdkVersion and android.buildToolsVersion are required to derive android.sdkPackages");
      }
      return "platform-tools platforms;android-" + compile + " build-tools;" + tools;
    }
    function appVersion() {
      if (!m.version) fail("version is required to derive appVersion");
      return "@" + m.version;
    }
    let v;
    if (key === "android.sdkPackages") {
      v = sdkPackages();
    } else if (key === "appVersion") {
      v = appVersion();
    } else {
      v = key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), m);
    }
    if (v === undefined) fail("no key " + key + " in build-metadata.json");
    if (v !== null && typeof v === "object") fail("key " + key + " is not atomic");
    process.stdout.write(String(v));
  ' "${META}" "$1"
}

get_key() { resolve_key "$1"; }

version_code() {
  local v="$1" major minor patch code
  require_semver "${v}"
  IFS='.' read -r major minor patch <<< "${v}"
  (( 10#${minor} < 100 )) || die "minor must be < 100 for the version code scheme (got ${minor})"
  (( 10#${patch} < 100 )) || die "patch must be < 100 for the version code scheme (got ${patch})"
  code=$(( 10#${major} * 10000 + 10#${minor} * 100 + 10#${patch} ))
  (( code >= 1 )) || code=1
  echo "${code}"
}

sync_files() {
  local mode="$1"
  MODE="${mode}" META="${META}" APP_JSON="${APP_JSON}" PKG_JSON="${PKG_JSON}" WORKFLOW_DIR="${WORKFLOW_DIR}" \
    node - <<'JS'
const fs = require("fs");
const path = require("path");
const { MODE, META, APP_JSON, PKG_JSON, WORKFLOW_DIR } = process.env;

const meta = JSON.parse(fs.readFileSync(META, "utf8"));

function fail(msg) { console.error("error: " + msg); process.exit(1); }

function assertAtomic(value, key) {
  if (value !== null && typeof value === "object") fail(`build-metadata.json key '${key}' must be atomic`);
}

function walkAtomic(node, prefix) {
  if (node === null || typeof node !== "object" || Array.isArray(node)) {
    if (Array.isArray(node)) fail(`build-metadata.json key '${prefix}' must be atomic`);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (k.startsWith("$")) fail(`build-metadata.json must not contain '${key}'`);
    if (key === "android.sdkPackages") fail("android.sdkPackages is derived from android.compileSdkVersion and android.buildToolsVersion; do not store it");
    if (key === "appVersion") fail("appVersion is derived from version; do not store it");
    if (v !== null && typeof v === "object" && !Array.isArray(v)) walkAtomic(v, key);
    else assertAtomic(v, key);
  }
}

walkAtomic(meta, "");

const version = meta.version;
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`build-metadata.json version '${version}' is not x.y.z`);
const [major, minor, patch] = version.split(".").map(Number);
if (minor >= 100 || patch >= 100) fail("minor and patch must be < 100 for the version code scheme");
const code = Math.max(1, major * 10000 + minor * 100 + patch);

function sdkPackages() {
  const compile = meta.android && meta.android.compileSdkVersion;
  const tools = meta.android && meta.android.buildToolsVersion;
  if (compile == null || tools == null) {
    fail("android.compileSdkVersion and android.buildToolsVersion are required to derive android.sdkPackages");
  }
  return `platform-tools platforms;android-${compile} build-tools;${tools}`;
}

function appVersion() {
  return `@${version}`;
}

function getKey(key) {
  if (key === "android.sdkPackages") return sdkPackages();
  if (key === "appVersion") return appVersion();
  const v = key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), meta);
  if (v === undefined) fail(`workflow references unknown key '${key}'`);
  if (v !== null && typeof v === "object") fail(`workflow key '${key}' is not atomic`);
  return String(v);
}

let drift = 0;
function emit(file, before, after, what) {
  if (before === after) return;
  const rel = path.relative(process.cwd(), file);
  if (MODE === "apply") {
    fs.writeFileSync(file, after);
    console.log(`updated ${rel}: ${what}`);
  } else {
    console.log(`DRIFT   ${rel}: ${what}`);
    drift++;
  }
}

{
  const before = fs.readFileSync(APP_JSON, "utf8");
  const app = JSON.parse(before);
  const ios = app.expo.ios || {};
  const android = app.expo.android || {};
  const released = appVersion();
  const sameVersion =
    app.expo.version === released &&
    ios.buildNumber === String(code) &&
    android.versionCode === code;

  let hasBuildProps = false;
  if (fs.existsSync(PKG_JSON)) {
    const pkg = JSON.parse(fs.readFileSync(PKG_JSON, "utf8"));
    hasBuildProps = !!((pkg.dependencies || {})["expo-build-properties"] || (pkg.devDependencies || {})["expo-build-properties"]);
  }

  let sameBuildProps = true;
  if (hasBuildProps) {
    const plugins = Array.isArray(app.expo.plugins) ? app.expo.plugins : [];
    const entry = plugins.find(p => (Array.isArray(p) ? p[0] : p) === "expo-build-properties");
    const cfg = Array.isArray(entry) && entry[1] ? entry[1] : {};
    sameBuildProps =
      cfg.android &&
      cfg.android.compileSdkVersion === meta.android.compileSdkVersion &&
      cfg.android.targetSdkVersion === meta.android.targetSdkVersion &&
      cfg.android.buildToolsVersion === meta.android.buildToolsVersion &&
      cfg.ios &&
      cfg.ios.deploymentTarget === meta.ios.deploymentTarget;
  }

  if (!sameVersion || (hasBuildProps && !sameBuildProps)) {
    app.expo.version = released;
    app.expo.ios = { ...ios, buildNumber: String(code) };
    app.expo.android = { ...android, versionCode: code };
    if (hasBuildProps) {
      const desired = ["expo-build-properties", {
        android: {
          compileSdkVersion: meta.android.compileSdkVersion,
          targetSdkVersion: meta.android.targetSdkVersion,
          buildToolsVersion: meta.android.buildToolsVersion,
        },
        ios: { deploymentTarget: meta.ios.deploymentTarget },
      }];
      const plugins = Array.isArray(app.expo.plugins) ? app.expo.plugins : [];
      const idx = plugins.findIndex(p => (Array.isArray(p) ? p[0] : p) === "expo-build-properties");
      if (idx >= 0) {
        const existing = Array.isArray(plugins[idx]) && plugins[idx][1] ? plugins[idx][1] : {};
        desired[1].android = { ...(existing.android || {}), ...desired[1].android };
        desired[1].ios = { ...(existing.ios || {}), ...desired[1].ios };
        desired[1] = { ...existing, ...desired[1] };
        plugins[idx] = desired;
      } else {
        plugins.push(desired);
      }
      app.expo.plugins = plugins;
    }
    emit(APP_JSON, before, JSON.stringify(app, null, 2) + "\n",
      `expo.version=${released} ios.buildNumber=${code} android.versionCode=${code}${hasBuildProps ? " expo-build-properties" : ""}`);
  } else if (MODE === "apply" && !hasBuildProps) {
    console.log("note: expo-build-properties is not a dependency of apps/mobile; compileSdk/targetSdk/deploymentTarget not applied to app.json");
  }
}

if (fs.existsSync(PKG_JSON)) {
  const before = fs.readFileSync(PKG_JSON, "utf8");
  const pkg = JSON.parse(before);
  if (pkg.version !== version) {
    pkg.version = version;
    emit(PKG_JSON, before, JSON.stringify(pkg, null, 2) + "\n", `version=${version}`);
  }
}

if (fs.existsSync(WORKFLOW_DIR)) {
  const re = /^(\s*[\w.-]+:\s*)(.*?)(\s*# @sync ([\w.]+)\s*)$/;
  for (const name of fs.readdirSync(WORKFLOW_DIR)) {
    if (!/\.ya?ml$/.test(name)) continue;
    const file = path.join(WORKFLOW_DIR, name);
    const before = fs.readFileSync(file, "utf8");
    const changed = [];
    const after = before.split("\n").map(line => {
      const m = line.match(re);
      if (!m) return line;
      const [, head, oldVal, tail, key] = m;
      const newVal = JSON.stringify(getKey(key));
      if (oldVal !== newVal) changed.push(`${key}: ${oldVal} -> ${newVal}`);
      return head + newVal + tail;
    }).join("\n");
    emit(file, before, after, changed.join(", "));
  }
}

if (MODE === "check") {
  if (drift) {
    console.error(`\n${drift} file(s) out of sync with apps/mobile/build-metadata.json. Run: scripts/mobile-sync.sh apply`);
    process.exit(1);
  }
  console.log(`OK: everything in sync with build-metadata.json (version ${version}, build number / versionCode ${code})`);
}
JS
}

tag_platform() {
  local t="$1" p
  for p in "${PLATFORMS[@]}"; do [[ "${t}" == "${p}@"* ]] && { echo "${p}"; return; }; done
  die "tag '${t}' must be ios@x.y.z or android@x.y.z"
}

tag_version() {
  local t="$1" p v
  p="$(tag_platform "${t}")" || exit 1
  v="${t#"${p}@"}"
  require_semver "${v}"
  echo "${v}"
}

cmd_apply()  { ( cd "${ROOT}" && sync_files apply ); }
cmd_check()  { ( cd "${ROOT}" && sync_files check ); }

cmd_get() {
  [[ -n "${1:-}" ]] || usage 1
  if [[ "$1" == "code" ]]; then version_code "$(get_key version)"; else get_key "$1"; echo; fi
}

cmd_version() {
  local v="${1:-}"
  [[ -n "${v}" ]] || usage 1
  require_semver "${v}"
  version_code "${v}" >/dev/null
  node -e '
    const fs = require("fs");
    const m = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    m.version = process.argv[2];
    delete m.$comment;
    if (m.android) delete m.android.sdkPackages;
    fs.writeFileSync(process.argv[1], JSON.stringify(m, null, 2) + "\n");
  ' "${META}" "${v}"
  echo "build-metadata.json: version=${v}"
  cmd_apply
}

cmd_check_tag() {
  local t="${1:-}" want have
  [[ -n "${t}" ]] || usage 1
  want="$(tag_version "${t}")" || exit 1
  have="$(get_key version)"
  [[ "${want}" == "${have}" ]] \
    || die "tag '${t}' says ${want} but build-metadata.json says ${have}. Run: scripts/mobile-sync.sh version ${want}"
  echo "OK: tag '${t}' matches build-metadata.json version ${have} (build number / versionCode $(version_code "${have}"))"
}

cmd_tag() {
  local which="all" push=0 v p t
  for arg in "$@"; do
    case "${arg}" in
      ios|android|all) which="${arg}" ;;
      --push) push=1 ;;
      *) usage 1 ;;
    esac
  done
  git -C "${ROOT}" diff --quiet HEAD -- apps/mobile .github/workflows \
    || die "uncommitted changes under apps/mobile or .github/workflows; run 'apply', commit, then tag"
  cmd_check >/dev/null || die "derived files are out of sync; run 'apply' and commit first"

  v="$(get_key version)"
  local targets=()
  if [[ "${which}" == "all" ]]; then targets=("${PLATFORMS[@]}"); else targets=("${which}"); fi
  for p in "${targets[@]}"; do
    t="${p}@${v}"
    git -C "${ROOT}" rev-parse -q --verify "refs/tags/${t}" >/dev/null && die "tag ${t} already exists"
    git -C "${ROOT}" tag -a "${t}" -m "${p} ${v}"
    echo "created tag ${t}"
    if (( push )); then git -C "${ROOT}" push origin "refs/tags/${t}"; echo "pushed tag ${t}"; fi
  done
  (( push )) || echo "push with: git push origin --tags   (or re-run with --push)"
}

main() {
  local cmd="${1:-}"
  [[ -n "${cmd}" ]] || usage 1
  shift
  case "${cmd}" in
    apply)     cmd_apply "$@" ;;
    check)     cmd_check "$@" ;;
    version)   cmd_version "$@" ;;
    check-tag) cmd_check_tag "$@" ;;
    tag)       cmd_tag "$@" ;;
    get)       cmd_get "$@" ;;
    -h|--help|help) usage 0 ;;
    *) usage 1 ;;
  esac
}

main "$@"
