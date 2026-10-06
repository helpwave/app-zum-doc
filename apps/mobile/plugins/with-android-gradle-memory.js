const { withGradleProperties } = require("expo/config-plugins")

const JVM_ARGS = "-Xmx4g -XX:MaxMetaspaceSize=1g"

module.exports = function withAndroidGradleMemory(config) {
  return withGradleProperties(config, (mod) => {
    mod.modResults = mod.modResults.filter(
      (item) => !(item.type === "property" && item.key === "org.gradle.jvmargs"),
    )
    mod.modResults.push({ type: "property", key: "org.gradle.jvmargs", value: JVM_ARGS })
    return mod
  })
}
