import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderBarcode } from './render.ts'
import { normalizePzn, type BarcodeFormat } from './pzn.ts'

const outputDirectory = fileURLToPath(new URL(
  '../../example-data/barcodes/',
  import.meta.url,
))

const usage = 'Usage: medication-barcode <pzn> [--code39] [--datamatrix]'

type Request = {
  pzn: string
  formats: BarcodeFormat[]
}

function parseArguments(argv: string[]): Request {
  let code39 = false
  let datamatrix = false
  const positional: string[] = []
  for (const argument of argv) {
    if (argument === '--code39') {
      code39 = true
      continue
    }
    if (argument === '--datamatrix') {
      datamatrix = true
      continue
    }
    if (argument.startsWith('-')) {
      throw new Error(`Unknown argument ${argument}.\n${usage}`)
    }
    positional.push(argument)
  }
  if (positional.length !== 1) {
    throw new Error(usage)
  }
  const formats: BarcodeFormat[] = []
  if (code39 || !datamatrix) {
    formats.push('code39')
  }
  if (datamatrix) {
    formats.push('datamatrix')
  }
  return {
    pzn: normalizePzn(positional[0] ?? ''),
    formats,
  }
}

async function writeBarcodes(request: Request) {
  await mkdir(outputDirectory, { recursive: true })
  const written: string[] = []
  for (const format of request.formats) {
    const filePath = path.join(outputDirectory, `${request.pzn}-${format}.png`)
    await writeFile(filePath, await renderBarcode(request.pzn, format))
    written.push(filePath)
  }
  return written
}

try {
  const written = await writeBarcodes(parseArguments(process.argv.slice(2)))
  for (const filePath of written) {
    console.log(filePath)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}
