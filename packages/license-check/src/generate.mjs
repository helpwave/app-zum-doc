#!/usr/bin/env node
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { existsSync, readFileSync, realpathSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"

const licenseNames = {
  "0BSD": "BSD Zero Clause License",
  "AGPL-3.0-only": "GNU Affero General Public License v3.0 only",
  "AGPL-3.0-or-later": "GNU Affero General Public License v3.0 or later",
  "Apache-2.0": "Apache License 2.0",
  "BSD-2-Clause": "BSD 2-Clause License",
  "BSD-3-Clause": "BSD 3-Clause License",
  "CC-BY-4.0": "Creative Commons Attribution 4.0 International",
  "CC0-1.0": "Creative Commons Zero v1.0 Universal",
  "ISC": "ISC License",
  "LGPL-3.0-only": "GNU Lesser General Public License v3.0 only",
  "LGPL-3.0-or-later": "GNU Lesser General Public License v3.0 or later",
  "MIT": "MIT License",
  "MIT-0": "MIT No Attribution",
  "MPL-2.0": "Mozilla Public License 2.0",
  "Unlicense": "The Unlicense",
  "UNKNOWN": "Unknown",
  "UNLICENSED": "Unlicensed",
}

const licenseFileNames = [
  "LICENSE",
  "LICENCE",
  "COPYING",
  "LICENSE.md",
  "LICENCE.md",
  "COPYING.md",
  "LICENSE.txt",
  "LICENCE.txt",
  "COPYING.txt",
]

function readArgs(argv) {
  const args = {
    packagePath: path.resolve("package.json"),
    outputPath: path.resolve("generated/licenses.ts"),
  }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--package") {
      args.packagePath = path.resolve(argv[index + 1] ?? "")
      index += 1
      continue
    }
    if (arg === "--output") {
      args.outputPath = path.resolve(argv[index + 1] ?? "")
      index += 1
    }
  }
  return args
}

function readPackage(packageJsonPath) {
  return JSON.parse(readFileSync(packageJsonPath, "utf8"))
}

function resolveDependency(name, fromPackageJsonPath) {
  const require = createRequire(fromPackageJsonPath)
  try {
    return realpathSync(require.resolve(path.join(name, "package.json")))
  } catch {
    return null
  }
}

function licenseExpression(pkg) {
  if (typeof pkg.license === "string" && pkg.license.trim()) {
    return pkg.license.trim()
  }
  if (pkg.license && typeof pkg.license === "object" && typeof pkg.license.type === "string") {
    return pkg.license.type.trim()
  }
  if (Array.isArray(pkg.licenses)) {
    const parts = pkg.licenses
      .map((entry) => {
        if (typeof entry === "string") {
          return entry
        }
        if (entry && typeof entry.type === "string") {
          return entry.type
        }
        return ""
      })
      .map((entry) => entry.trim())
      .filter(Boolean)
    if (parts.length > 0) {
      return parts.join(" OR ")
    }
  }
  return "UNKNOWN"
}

function licenseIdsFromExpression(expression) {
  const withoutParens = expression.replace(/[()]/g, " ")
  const parts = withoutParens
    .split(/\s+(?:OR|AND)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : ["UNKNOWN"]
}

function licenseName(id) {
  const baseId = id.split("#")[0] ?? id
  return licenseNames[baseId] ?? baseId
}

function readLicenseText(packageJsonPath) {
  const directory = path.dirname(packageJsonPath)
  for (const fileName of licenseFileNames) {
    const filePath = path.join(directory, fileName)
    if (!existsSync(filePath)) {
      continue
    }
    const text = readFileSync(filePath, "utf8")
    if (text.includes("\u0000")) {
      continue
    }
    const trimmed = text.trim()
    if (trimmed) {
      return trimmed
    }
  }
  return ""
}

function httpUrl(value) {
  let url = value.trim()
  if (!url) {
    return undefined
  }
  url = url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "")
    .replace(/^ssh:\/\/git@github\.com\//, "https://github.com/")
    .replace(/^ssh:\/\/github\.com\//, "https://github.com/")
    .replace(/^git@github\.com:/, "https://github.com/")
  if (url.startsWith("github:")) {
    url = `https://github.com/${url.slice("github:".length)}`
  }
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url)) {
    url = `https://github.com/${url}`
  }
  if (!/^https?:\/\//.test(url)) {
    return undefined
  }
  return url
}

function repositoryUrl(repository) {
  if (!repository) {
    return undefined
  }
  const raw = typeof repository === "string" ? repository : repository.url
  if (typeof raw !== "string") {
    return undefined
  }
  return httpUrl(raw)
}

function packageUrl(pkg) {
  if (typeof pkg.homepage !== "string") {
    return undefined
  }
  return httpUrl(pkg.homepage)
}

function normalizedText(text) {
  return text.replace(/\s+/g, " ").trim()
}

function assignLicense(licenses, spdxId, text) {
  const matches = Object.values(licenses).filter((license) => {
    return license.id === spdxId || license.id.startsWith(`${spdxId}#`)
  })
  const incoming = normalizedText(text)
  const sameText = matches.find((license) => normalizedText(license.text) === incoming)
  if (sameText) {
    return sameText.id
  }
  const empty = matches.find((license) => !normalizedText(license.text))
  if (empty && incoming) {
    empty.text = text
    return empty.id
  }
  if (!incoming && matches.length > 0) {
    return matches[0].id
  }
  const id = matches.length === 0 ? spdxId : `${spdxId}#${createHash("sha256").update(incoming).digest("hex").slice(0, 8)}`
  licenses[id] = {
    id,
    name: licenseName(id),
    text,
  }
  return id
}

function collectCredits(rootPackageJsonPath) {
  const licenses = {}
  const packages = []
  const seenPaths = new Set()
  const seenPackages = new Set()

  const visit = (packageJsonPath) => {
    const pkg = readPackage(packageJsonPath)
    const dependencies = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.optionalDependencies ?? {}),
    }
    const names = Object.keys(dependencies).sort((left, right) => left.localeCompare(right))
    for (const name of names) {
      const resolved = resolveDependency(name, packageJsonPath)
      if (!resolved || seenPaths.has(resolved)) {
        continue
      }
      seenPaths.add(resolved)
      const dependency = readPackage(resolved)
      const packageName = dependency.name ?? name
      const version = String(dependency.version ?? "")
      const packageKey = `${packageName}@${version}`
      if (!seenPackages.has(packageKey)) {
        seenPackages.add(packageKey)
        const expression = licenseExpression(dependency)
        const ids = licenseIdsFromExpression(expression)
        const text = readLicenseText(resolved)
        const licenseIds = ids.map((id) => {
          return assignLicense(licenses, id, ids.length === 1 ? text : "")
        })
        const credit = {
          name: packageName,
          version,
          licenseIds,
        }
        const url = packageUrl(dependency)
        const repository = repositoryUrl(dependency.repository)
        if (url) {
          credit.url = url
        }
        if (repository) {
          credit.repository = repository
        }
        packages.push(credit)
      }
      visit(resolved)
    }
  }

  visit(rootPackageJsonPath)
  packages.sort((left, right) => {
    const byName = left.name.localeCompare(right.name)
    if (byName !== 0) {
      return byName
    }
    return left.version.localeCompare(right.version)
  })
  const orderedLicenses = {}
  for (const id of Object.keys(licenses).sort((left, right) => left.localeCompare(right))) {
    orderedLicenses[id] = licenses[id]
  }
  return {
    licenses: orderedLicenses,
    packages,
  }
}

function renderDocument(document) {
  return `import type { LicenseDocument } from "@app-zum-doc/license-check"

export const licenseDocument: LicenseDocument = ${JSON.stringify(document, null, 2)}
`
}

const { packagePath, outputPath } = readArgs(process.argv.slice(2))
const document = collectCredits(packagePath)
mkdirSync(path.dirname(outputPath), { recursive: true })
writeFileSync(outputPath, renderDocument(document))
process.stdout.write(`Wrote ${document.packages.length} packages to ${outputPath}\n`)
