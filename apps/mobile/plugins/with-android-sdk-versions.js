const { withAppBuildGradle } = require("expo/config-plugins")

const appJson = require("../app.json")

function pluginAndroid() {
  const plugins = appJson.expo.plugins ?? []
  const entry = plugins.find((plugin) => (
    Array.isArray(plugin) ? plugin[0] : plugin
  ) === "expo-build-properties")
  return Array.isArray(entry) && entry[1] ? (entry[1].android ?? {}) : {}
}

function withAndroidSdkVersions(config) {
  const android = pluginAndroid()
  const compileSdk = android.compileSdkVersion ?? 36
  const targetSdk = android.targetSdkVersion ?? 36

  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents
    contents = contents.replace(
      /^([ \t]*compileSdk)[ \t]+.+$/m,
      `$1 ${compileSdk}`,
    )
    contents = contents.replace(
      /^([ \t]*targetSdkVersion)[ \t]+.+$/m,
      `$1 ${targetSdk}`,
    )
    mod.modResults.contents = contents
    return mod
  })
}

module.exports = withAndroidSdkVersions
