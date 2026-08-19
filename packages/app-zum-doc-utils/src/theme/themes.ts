import { createThemeTokens } from "@helpwave/hightide-design/theme-tokens"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
import { azdPrimitiveTokens } from "./primitives"
import { toAzdComponents } from "./toComponents"
import type { AzdThemeTokens } from "./types"

const { teal, white } = azdPrimitiveTokens.color.palettes

function createAzdThemeTokens(themeMode: "light" | "dark"): AzdThemeTokens {
  const primary = themeMode === "light" ? teal.value[600] : OKLCHUtils.changeLightness(teal.value[600], 0.6)
  const secondary = themeMode === "light" ? "#458ab9" : OKLCHUtils.changeLightness("#458ab9", 0.6)
  const tertiary = themeMode === "light" ? "#771d9b" : OKLCHUtils.changeLightness("#771d9b", 0.6)

  const themeTokens = createThemeTokens({
    themeMode,
    colors: {
      primary: {
        color: primary,
        onColor: white.value,
      },
      secondary: {
        color: secondary,
        onColor: white.value,
      },
      tertiary: {
        color: tertiary,
        onColor: white.value,
      }
    },
  })

  return {
    ...themeTokens,
    color: {
      ...themeTokens.color,
      appointment: {
        color: secondary,
        onColor: white.value,
      },
      referral: {
        color: tertiary,
        onColor: white.value,
      },
      prescription: {
        color: primary,
        onColor: white.value,
      }
    },
    componentColors: toAzdComponents({ themeTokens }),
  }
}

export const azdThemeTokens = {
  light: createAzdThemeTokens("light"),
  dark: createAzdThemeTokens("dark"),
} as const satisfies Record<"light" | "dark", AzdThemeTokens>
