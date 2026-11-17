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

function isDevMode() {
  return process.env.CI !== "1" && process.env.NODE_ENV !== "production"
}

function resolveMedicalProductSearchUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL?.trim()
  if (fromEnv) {
    return fromEnv
  }
  return isDevMode()
    ? "http://127.0.0.1:8080"
    : "https://medication-search.helpwave.de"
}

const medicalProductSearchUrl = resolveMedicalProductSearchUrl()
process.env.EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL = medicalProductSearchUrl

function withDevCleartext(plugin) {
  const name = Array.isArray(plugin) ? plugin[0] : plugin
  if (name !== "expo-build-properties" || !isDevMode()) {
    return plugin
  }
  const options = Array.isArray(plugin) && plugin[1] ? plugin[1] : {}
  return [
    "expo-build-properties",
    {
      ...options,
      android: {
        ...options.android,
        usesCleartextTraffic: true,
      },
    },
  ]
}

const devMode = isDevMode()

module.exports = {
  expo: {
    ...appJson.expo,
    version: resolveVersion(),
    extra: {
      ...(appJson.expo.extra ?? {}),
      medicalProductSearchUrl,
    },
    android: {
      ...appJson.expo.android,
      versionCode: resolveVersionCode(),
    },
    ios: {
      ...appJson.expo.ios,
      buildNumber: resolveIosBuildNumber(),
      ...(resolveIosTeamId() ? { appleTeamId: resolveIosTeamId() } : {}),
      ...(devMode
        ? {
          infoPlist: {
            ...(appJson.expo.ios?.infoPlist ?? {}),
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: true,
            },
          },
        } : {}
      ),
    },
    plugins: [
      ...(appJson.expo.plugins ?? []).map(withDevCleartext),
      "./plugins/with-android-release-signing.js",
      "./plugins/with-android-abi-splits.js",
      "./plugins/with-android-sdk-versions.js",
      "./plugins/with-android-reproducible-dev-server-ip.js",
      "./plugins/with-android-gradle-memory.js",
    ],
  },
}
