import {
  azdThemeTokens,
  type AzdThemeTokens,
} from "@app-zum-doc/utils/theme"
import { HightideConfigUtils } from "@helpwave/hightide-native/global-contexts"
import { createHightideTheme } from "@helpwave/hightide-native/theme"

export type AzdTheme = ReturnType<typeof createAzdTheme>

export function createAzdTheme(tokens: AzdThemeTokens) {
  const base = createHightideTheme(tokens)

  return {
    ...base,
    colors: {
      ...tokens.color,
      ...base.colors
    },
  }
}

const defaults = HightideConfigUtils.defaultSupportedThemes

export const azdSupportedThemes = {
  light: {
    nameTranslations: defaults.light.nameTranslations,
    theme: createAzdTheme(azdThemeTokens.light),
  },
  dark: {
    nameTranslations: defaults.dark.nameTranslations,
    theme: createAzdTheme(azdThemeTokens.dark),
  },
}
