const { withAppBuildGradle } = require("expo/config-plugins")

module.exports = function withAndroidAbiSplits(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes("splits {")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /android \{\n/,
        `android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a"
            universalApk false
        }
    }
`,
      )
    }
    return mod
  })
}
