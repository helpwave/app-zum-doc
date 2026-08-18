import { createThemeTokens } from "@helpwave/hightide-design/theme-tokens"
import { azdPrimitiveTokens } from "./primitives"
import { toAzdComponents } from "./toComponents"
import type { AzdThemeTokens } from "./types"

const { teal, white } = azdPrimitiveTokens.color.palettes

function createAzdThemeTokens(themeMode: "light" | "dark"): AzdThemeTokens {
  const themeTokens = createThemeTokens({
    themeMode,
    colors: {
      primary: {
        color: teal.value[600],
        onColor: white.value,
      },
    },
  })

  return {
    ...themeTokens,
    componentColors: toAzdComponents({ themeTokens }),
  }
}

export const azdThemeTokens = {
  light: createAzdThemeTokens("light"),
  dark: createAzdThemeTokens("dark"),
} as const satisfies Record<"light" | "dark", AzdThemeTokens>
