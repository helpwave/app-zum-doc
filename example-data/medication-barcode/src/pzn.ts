export type BarcodeFormat = 'code39' | 'datamatrix'

export function normalizePzn(value: string) {
  const digits = value.trim()
  if (!/^\d{7,8}$/.test(digits)) {
    throw new Error('PZN must be 7 or 8 digits.')
  }
  return digits.padStart(8, '0')
}

export function code39Payload(pzn: string) {
  return `-${pzn}`
}

export function dataMatrixPayload(pzn: string) {
  const body = `04150${pzn}`
  let sum = 0
  for (let index = 0; index < body.length; index += 1) {
    const digit = Number(body[body.length - 1 - index])
    const weight = index % 2 === 0 ? 3 : 1
    sum += digit * weight
  }
  const check = (10 - (sum % 10)) % 10
  return `01${body}${check}`
}
