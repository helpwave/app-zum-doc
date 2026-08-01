import { toHightideSemanticTokens } from "@helpwave/hightide-design/tokens"
import type { ToSemanticArgs } from "@helpwave/hightide-design/tokens"
import type { AzdPrimitiveTokens, AzdSemanticTokens } from "./types"

export function toAzdSemantic({
  themeName,
  primitiveTokens,
}: ToSemanticArgs<AzdPrimitiveTokens>): AzdSemanticTokens {
  return {
    ...toHightideSemanticTokens({
      themeName,
      primitiveTokens,
    }),
    primary: primitiveTokens.teal.value[600],
    primaryHover: primitiveTokens.teal.value[700],
    onPrimary: primitiveTokens.white.value,
  }
}
