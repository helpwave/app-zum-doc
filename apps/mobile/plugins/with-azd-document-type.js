const { AndroidConfig, withAndroidManifest, withInfoPlist } = require("expo/config-plugins")

const MIME_TYPE = "application/vnd.azd.backup"
const FILE_EXTENSION = "azd-backup"
const UTI = "de.helpwave.appzumdoc.backup"

function withAzdDocumentType(config) {
  config = withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults)
    const activities = application.activity ?? []
    const mainActivity = activities.find((activity) => {
      const name = activity.$?.["android:name"]
      return name === ".MainActivity"
        || name === "de.helpwave.appzumdoc.MainActivity"
        || (typeof name === "string" && name.endsWith(".MainActivity"))
    })

    if (!mainActivity) {
      throw new Error("Could not find MainActivity in AndroidManifest.xml")
    }

    mainActivity["intent-filter"] ??= []
    const alreadyExists = mainActivity["intent-filter"].some((filter) => {
      const actions = filter.action ?? []
      const categories = filter.category ?? []
      const data = filter.data ?? []
      const hasViewAction = actions.some(
        (action) => action.$?.["android:name"] === "android.intent.action.VIEW",
      )
      const hasDefaultCategory = categories.some(
        (category) => category.$?.["android:name"] === "android.intent.category.DEFAULT",
      )
      const hasMimeType = data.some(
        (item) => item.$?.["android:mimeType"] === MIME_TYPE,
      )
      return hasViewAction && hasDefaultCategory && hasMimeType
    })

    if (!alreadyExists) {
      mainActivity["intent-filter"].push({
        action: [
          {
            $: {
              "android:name": "android.intent.action.VIEW",
            },
          },
        ],
        category: [
          {
            $: {
              "android:name": "android.intent.category.DEFAULT",
            },
          },
          {
            $: {
              "android:name": "android.intent.category.BROWSABLE",
            },
          },
        ],
        data: [
          {
            $: {
              "android:mimeType": MIME_TYPE,
            },
          },
        ],
      })
    }

    return mod
  })

  config = withInfoPlist(config, (mod) => {
    const infoPlist = mod.modResults
    const exportedTypes = infoPlist.UTExportedTypeDeclarations ?? []
    const alreadyExported = exportedTypes.some(
      (type) => type.UTTypeIdentifier === UTI,
    )
    if (!alreadyExported) {
      exportedTypes.push({
        UTTypeIdentifier: UTI,
        UTTypeDescription: "AzD Backup",
        UTTypeConformsTo: ["public.data"],
        UTTypeTagSpecification: {
          "public.filename-extension": [FILE_EXTENSION],
          "public.mime-type": MIME_TYPE,
        },
      })
    }
    infoPlist.UTExportedTypeDeclarations = exportedTypes

    const documentTypes = infoPlist.CFBundleDocumentTypes ?? []
    const alreadyRegistered = documentTypes.some(
      (type) => Array.isArray(type.LSItemContentTypes) && type.LSItemContentTypes.includes(UTI),
    )
    if (!alreadyRegistered) {
      documentTypes.push({
        CFBundleTypeName: "AzD Backup",
        LSHandlerRank: "Owner",
        LSItemContentTypes: [UTI],
      })
    }
    infoPlist.CFBundleDocumentTypes = documentTypes
    return mod
  })

  return config
}

module.exports = withAzdDocumentType
