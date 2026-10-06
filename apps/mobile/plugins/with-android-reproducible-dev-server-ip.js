const { withAppBuildGradle } = require("expo/config-plugins")

const LINE = 'android.buildTypes.release.resValue "string", "react_native_dev_server_ip", "localhost"'

module.exports = function withAndroidReproducibleDevServerIp(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(LINE)) {
      mod.modResults.contents = `${mod.modResults.contents.trimEnd()}\n\n${LINE}\n`
    }
    return mod
  })
}
