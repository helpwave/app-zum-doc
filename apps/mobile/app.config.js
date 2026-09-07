const appJson = require("./app.json")

module.exports = {
  expo: {
    ...appJson.expo,
    version: process.env.APP_VERSION ?? appJson.expo.version,
    android: {
      ...appJson.expo.android,
      versionCode: Number.parseInt(
        process.env.ANDROID_VERSION_CODE ?? String(appJson.expo.android.versionCode ?? 1),
        10,
      ),
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      "./plugins/with-android-release-signing.js",
    ],
  },
}
