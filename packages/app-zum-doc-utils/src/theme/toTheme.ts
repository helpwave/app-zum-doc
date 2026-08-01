import { toHightideTheme } from "@helpwave/hightide-design/tokens"
import type { ToThemeArgs } from "@helpwave/hightide-design/tokens"
import type {
  AzdComponentTokens,
  AzdPrimitiveTokens,
  AzdSemanticTokens,
  AzdThemeTokens,
} from "./types"

export function toAzdTheme({
  themeName,
  primitiveTokens,
  semanticTokens,
  componentTokens,
}: ToThemeArgs<
  AzdPrimitiveTokens,
  AzdSemanticTokens,
  AzdComponentTokens
>): AzdThemeTokens {
  const base = toHightideTheme({
    themeName,
    primitiveTokens,
    semanticTokens,
    componentTokens,
  })

  return {
    ...base,
    colors: primitiveTokens,
    semanticColors: semanticTokens,
    componentColors: componentTokens,
  }
}
