const { withAndroidManifest } = require("expo/config-plugins")

const MAIN_ACTIVITY_NAMES = new Set([".MainActivity"])

function isMainActivity(name) {
  if (typeof name !== "string" || name.length === 0) {
    return false
  }
  return MAIN_ACTIVITY_NAMES.has(name) || name.endsWith(".MainActivity")
}

function withAndroidSingleTaskLaunchMode(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest
    if (manifest.$ && manifest.$["xmlns:tools"] == null) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools"
    }

    const application = manifest.application?.[0]
    const activities = application?.activity
    if (!Array.isArray(activities)) {
      return mod
    }

    for (const activity of activities) {
      if (!isMainActivity(activity.$?.["android:name"])) {
        continue
      }
      activity.$["android:launchMode"] = "singleTask"
      activity.$["android:documentLaunchMode"] = "never"
      const existingReplace = activity.$["tools:replace"]
      const replacements = new Set(
        typeof existingReplace === "string"
          ? existingReplace.split(",").map((value) => value.trim()).filter(Boolean)
          : [],
      )
      replacements.add("android:launchMode")
      replacements.add("android:documentLaunchMode")
      activity.$["tools:replace"] = [...replacements].join(",")
    }

    return mod
  })
}

module.exports = withAndroidSingleTaskLaunchMode
