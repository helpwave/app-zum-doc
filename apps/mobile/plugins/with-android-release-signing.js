const { withAppBuildGradle } = require("expo/config-plugins")

const RELEASE_SIGNING_CONFIG = `        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                def keystoreProperties = new Properties()
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                storeFile file(keystoreProperties["storeFile"])
                storePassword keystoreProperties["storePassword"]
                keyAlias keystoreProperties["keyAlias"]
                keyPassword keystoreProperties["keyPassword"]
                storeType keystoreProperties["storeType"]
            }
        }
`

const RELEASE_BUILD_TYPE_HEADER = `        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            } else {
                signingConfig signingConfigs.debug
            }`

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents

    if (!contents.includes('rootProject.file("keystore.properties")')) {
      contents = contents.replace(
        "    signingConfigs {\n        debug {",
        `    signingConfigs {\n${RELEASE_SIGNING_CONFIG}        debug {`,
      )
    }

    contents = contents.replace(
      /        release \{\n            \/\/ Caution! In production, you need to generate your own keystore file\.\n            \/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\n            signingConfig signingConfigs\.debug/,
      RELEASE_BUILD_TYPE_HEADER,
    )

    modConfig.modResults.contents = contents
    return modConfig
  })
}

module.exports = withAndroidReleaseSigning
