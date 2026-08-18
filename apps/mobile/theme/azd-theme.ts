import {
  azdThemeTokens,
  type AzdThemeTokens,
} from "@app-zum-doc/utils/theme"
import { HightideConfigUtils } from "@helpwave/hightide-native/global-contexts"
import { createHightideTheme } from "@helpwave/hightide-native/theme"

export type AzdTheme = ReturnType<typeof createAzdTheme>

type ThemeShadow = ReturnType<typeof createHightideTheme>["shadow"]["raised"]

export function toShadowStyle(shadow: ThemeShadow) {
  return {
    shadowColor: shadow.color,
    shadowOffset: {
      width: shadow.x,
      height: shadow.y,
    },
    shadowRadius: shadow.blur,
    shadowOpacity: 1,
    elevation: Math.max(shadow.y, 1),
  }
}

export function createAzdTheme(tokens: AzdThemeTokens) {
  const base = createHightideTheme(tokens)

  return {
    ...base,
    components: {
      ...base.components,
      screen: tokens.componentColors.screen,
      tabBar: tokens.componentColors.tabBar,
      homeSections: tokens.componentColors.homeSections,
      screenHeader: tokens.componentColors.screenHeader,
      searchField: tokens.componentColors.searchField,
      queryState: tokens.componentColors.queryState,
      profileSections: tokens.componentColors.profileSections,
      composer: tokens.componentColors.composer,
      structuredCard: tokens.componentColors.structuredCard,
      doctorDetail: tokens.componentColors.doctorDetail,
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

export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "")
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : hex
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red},${green},${blue},${alpha})`
}
