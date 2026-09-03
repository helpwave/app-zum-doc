import { hightideSemanticTokenResolvers } from "@helpwave/hightide-design/semantic-token-resolvers"
import type { ThemeTokens } from "@helpwave/hightide-design/theme-tokens"
import { azdPrimitiveTokens } from "./primitives"
import type { AzdComponentTokens } from "./types"

export function toAzdComponents({
  themeTokens,
}: {
  themeTokens: ThemeTokens
}): AzdComponentTokens {
  const color = themeTokens.color
  const teal = azdPrimitiveTokens.color.palettes.teal
  const textPrimary = color.surface.onColor
  const textSecondary = hightideSemanticTokenResolvers.asDescription({
    themeTokens,
    colorPair: color.surface,
  })
  const textTertiary = hightideSemanticTokenResolvers.asFaded({
    themeTokens,
    colorPair: color.surface,
  })
  const placeholder = textTertiary
  const onWhite = azdPrimitiveTokens.color.palettes.white.value

  return {}
}
