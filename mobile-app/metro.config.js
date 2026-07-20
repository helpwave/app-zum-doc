const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const hightidePackages = path.resolve(projectRoot, "../../hightide/packages")

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...(config.watchFolders ?? []), hightidePackages]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
]

module.exports = config
