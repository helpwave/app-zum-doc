const { withXcodeProject } = require("expo/config-plugins")

module.exports = function withIosKnownRegions(config) {
  return withXcodeProject(config, (mod) => {
    for (const region of Object.keys(mod.locales ?? {})) {
      mod.modResults.addKnownRegion(region)
    }
    return mod
  })
}
