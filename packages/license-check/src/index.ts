export type License = {
  id: string
  name: string
  text: string
}

export type PackageCredit = {
  name: string
  version: string
  licenseIds: string[]
  url?: string
  repository?: string
}

export type LicenseDocument = {
  licenses: Record<string, License>
  packages: PackageCredit[]
}
