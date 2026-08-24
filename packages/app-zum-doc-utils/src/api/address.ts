export type Address = {
  country: string
  province?: string
  city: string
  postalCode: string
  street: string
  streetNumber: number
}

export function formatAddressStreetLine(address: Address): string {
  return `${address.street} ${address.streetNumber}`
}

export function formatAddressCityLine(address: Address): string {
  return `${address.postalCode} ${address.city}`
}

export function formatAddressLines(address: Address): readonly [string, string] {
  return [formatAddressStreetLine(address), formatAddressCityLine(address)]
}

export function formatAddress(address: Address): string {
  return `${formatAddressStreetLine(address)}, ${formatAddressCityLine(address)}`
}

export function hasAddressContent(address: Address): boolean {
  return (
    address.street.trim().length > 0
    || address.streetNumber > 0
    || address.postalCode.trim().length > 0
    || address.city.trim().length > 0
  )
}
