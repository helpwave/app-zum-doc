import { hightidePrimitiveTokens } from "@helpwave/hightide-design/primitive-tokens"
import { tealPalette } from "./teal"
import type { AzdPrimitiveTokens } from "./types"

export const azdPrimitiveTokens = {
  ...hightidePrimitiveTokens,
  color: {
    ...hightidePrimitiveTokens.color,
    palettes: {
      ...hightidePrimitiveTokens.color.palettes,
      teal: tealPalette,
    },
  },
} as const satisfies AzdPrimitiveTokens
