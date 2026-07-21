const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")
const workspacePackages = path.resolve(workspaceRoot, "packages")
const hightidePackages = path.resolve(workspaceRoot, "../hightide/packages")

const config = getDefaultConfig(projectRoot)

config.watchFolders = [
  ...(config.watchFolders ?? []),
  workspacePackages,
  hightidePackages,
]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

module.exports = config
