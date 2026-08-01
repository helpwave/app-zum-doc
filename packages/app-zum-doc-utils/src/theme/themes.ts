import { constructThemeTokens } from "@helpwave/hightide-design/utils"
import { azdPrimitiveTokens } from "./primitives"
import { toAzdComponents } from "./toComponents"
import { toAzdSemantic } from "./toSemantic"
import { toAzdTheme } from "./toTheme"
import type { AzdThemeTokens } from "./types"

function createAzdThemeTokens(themeName: string): AzdThemeTokens {
  return constructThemeTokens({
    themeName,
    primitiveTokens: azdPrimitiveTokens,
    toSemantic: toAzdSemantic,
    toComponents: toAzdComponents,
    toTheme: toAzdTheme,
  })
}

export const azdThemeTokens = {
  light: createAzdThemeTokens("light"),
  dark: createAzdThemeTokens("dark"),
} as const satisfies Record<"light" | "dark", AzdThemeTokens>
