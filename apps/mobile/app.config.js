const appJson = require("./app.json")

function resolveVersion() {
  const fromEnv = process.env.APP_VERSION?.trim()
  return fromEnv || appJson.expo.version
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

module.exports = {
  expo: {
    ...appJson.expo,
    version: resolveVersion(),
    android: {
      ...appJson.expo.android,
      versionCode: resolveVersionCode(),
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      "./plugins/with-android-release-signing.js",
    ],
  },
}
