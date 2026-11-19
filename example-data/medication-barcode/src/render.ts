import { toBuffer } from 'bwip-js'
import { PNG } from 'pngjs'
import { glyph, glyphHeight, glyphWidth } from './glyphs.ts'
import { code39Payload, dataMatrixPayload, type BarcodeFormat } from './pzn.ts'

const glyphScale = 4
const glyphGap = 4

function textWidth(text: string) {
  if (text.length === 0) {
    return 0
  }
  return text.length * glyphWidth * glyphScale + (text.length - 1) * glyphGap
}

function paint(image: PNG, x: number, y: number) {
  const offset = (y * image.width + x) * 4
  image.data[offset] = 0
  image.data[offset + 1] = 0
  image.data[offset + 2] = 0
  image.data[offset + 3] = 255
}

function drawText(image: PNG, text: string, left: number, top: number) {
  let cursor = left
  for (const character of text) {
    const packed = glyph(character)
    for (let row = 0; row < glyphHeight; row += 1) {
      for (let column = 0; column < glyphWidth; column += 1) {
        if (packed[row * glyphWidth + column] !== '1') {
          continue
        }
        for (let dy = 0; dy < glyphScale; dy += 1) {
          for (let dx = 0; dx < glyphScale; dx += 1) {
            paint(
              image,
              cursor + column * glyphScale + dx,
              top + row * glyphScale + dy,
            )
          }
        }
      }
    }
    cursor += glyphWidth * glyphScale + glyphGap
  }
}

function white(width: number, height: number) {
  const image = new PNG({ width, height })
  image.data.fill(255)
  return image
}

function blit(target: PNG, source: PNG, left: number, top: number) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4
      const targetOffset = ((top + y) * target.width + left + x) * 4
      target.data[targetOffset] = source.data[sourceOffset]
      target.data[targetOffset + 1] = source.data[sourceOffset + 1]
      target.data[targetOffset + 2] = source.data[sourceOffset + 2]
      target.data[targetOffset + 3] = 255
    }
  }
}

async function symbol(format: BarcodeFormat, pzn: string) {
  if (format === 'code39') {
    return PNG.sync.read(await toBuffer({
      bcid: 'code39',
      text: code39Payload(pzn),
      scale: 4,
      height: 22,
      paddingwidth: 24,
      paddingheight: 24,
      backgroundcolor: 'FFFFFF',
    }))
  }
  return PNG.sync.read(await toBuffer({
    bcid: 'datamatrix',
    text: dataMatrixPayload(pzn),
    scale: 12,
    paddingwidth: 36,
    paddingheight: 36,
    backgroundcolor: 'FFFFFF',
  }))
}

export async function renderBarcode(pzn: string, format: BarcodeFormat) {
  const mark = await symbol(format, pzn)
  const lines = [
    `PZN ${pzn}`,
    format === 'code39' ? 'CODE 39' : 'DATA MATRIX',
  ]
  const margin = 56
  const gap = 32
  const lineGap = 14
  const lineHeight = glyphHeight * glyphScale
  const contentWidth = Math.max(mark.width, ...lines.map(textWidth))
  const width = contentWidth + margin * 2
  const height = margin + mark.height + gap + lines.length * lineHeight + lineGap + margin
  const image = white(width, height)
  blit(image, mark, Math.floor((width - mark.width) / 2), margin)
  let top = margin + mark.height + gap
  for (const line of lines) {
    drawText(image, line, Math.floor((width - textWidth(line)) / 2), top)
    top += lineHeight + lineGap
  }
  return PNG.sync.write(image)
}
