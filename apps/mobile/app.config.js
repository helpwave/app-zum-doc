const appJson = require("./app.json")

function storeVersion(raw) {
  let value = String(raw ?? "").trim()
  value = value.replace(/^(ios|android)@/i, "")
  value = value.replace(/^@/, "")
  return value
}

function resolveVersion() {
  const fromEnv = process.env.APP_VERSION?.trim()
  return storeVersion(fromEnv || appJson.expo.version)
}

function resolveVersionCode() {
  const fromEnv = process.env.ANDROID_VERSION_CODE?.trim()
  const parsed = Number.parseInt(
    fromEnv || String(appJson.expo.android.versionCode ?? 1),
    10,
  )
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }
  return parsed
}

function resolveIosBuildNumber() {
  const fromEnv = process.env.IOS_BUILD_NUMBER?.trim()
  if (fromEnv) {
    return fromEnv
  }
  return String(appJson.expo.ios?.buildNumber ?? resolveVersionCode())
}

function resolveIosTeamId() {
  return process.env.IOS_TEAM_ID?.trim() || appJson.expo.ios?.appleTeamId
}

module.exports = {
  expo: {
    ...appJson.expo,
    version: resolveVersion(),
    android: {
      ...appJson.expo.android,
      versionCode: resolveVersionCode(),
    },
    ios: {
      ...appJson.expo.ios,
      buildNumber: resolveIosBuildNumber(),
      ...(resolveIosTeamId() ? { appleTeamId: resolveIosTeamId() } : {}),
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      "./plugins/with-android-release-signing.js",
      "./plugins/with-android-abi-splits.js",
      "./plugins/with-android-sdk-versions.js",
      "./plugins/with-android-single-task.js",
    ],
  },
}
