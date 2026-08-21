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

  return {
    screen: {
      background: color.background.color,
    },
    tabBar: {
      background: color.surface.color,
      border: color.border,
      inactive: textTertiary,
      activeBackground: color.primary.color,
      activeForeground: color.primary.onColor,
    },
    homeSections: {
      heroStart: teal.value[900],
      heroEnd: teal.value[500],
      heroTitle: onWhite,
      searchBackground: color.surface.color,
      searchIcon: textTertiary,
      searchPlaceholder: placeholder,
      actionBackground: color.surface.color,
      actionText: textPrimary,
      actionIcon: textPrimary,
      sectionTitle: color.primary.color,
      showAll: textSecondary,
      cardBackground: color.surface.color,
      doctorName: textPrimary,
      doctorSpecialty: textTertiary,
      doctorMeta: textTertiary,
      openDot: color.primary.color,
      closedDot: textTertiary,
      avatarBackground: teal.value[100],
      avatarText: color.primary.color,
      requestDoctor: textTertiary,
      requestTitle: textPrimary,
      statusWarningBackground: "#C9A22726",
      statusWarningText: "#9A7B1E",
      statusWarningDot: "#C9A227",
      statusSuccessBackground: "#0579861A",
      statusSuccessText: color.primary.color,
      statusSuccessDot: color.primary.color,
      kindTagBackground: color.primary.color,
      kindTagText: onWhite,
      screenBackground: color.background.color,
    },
    screenHeader: {
      background: color.surface.color,
      border: color.border,
      title: color.surface.onColor,
    },
    searchField: {
      background: color.background.color,
      icon: textTertiary,
      text: textPrimary,
      placeholder: placeholder,
    },
    queryState: {
      background: color.surface.color,
      spinner: color.primary.color,
      loadingText: textSecondary,
      title: textPrimary,
      description: textSecondary,
    },
    profileSections: {
      name: textPrimary,
      meta: textSecondary,
      icon: color.primary.color,
      iconDanger: color.negative.color,
    },
    composer: {
      errorText: color.negative.color,
      errorBackground: color.surface.color,
    },
    structuredCard: {
      icon: color.primary.color,
      title: textPrimary,
      detail: textSecondary,
    },
    doctorDetail: {
      heroStart: teal.value[900],
      heroEnd: teal.value[500],
      heroIcon: onWhite,
      cardBackground: color.surface.color,
      cardBorder: color.border,
      name: textPrimary,
      specialty: textTertiary,
      openDot: color.primary.color,
      closedDot: textTertiary,
      statusText: textPrimary,
      phoneText: textPrimary,
      ctaBackground: color.surface.color,
      ctaText: color.primary.color,
      sectionLabel: textSecondary,
      rowBackground: color.surface.color,
      rowLabel: textPrimary,
      rowValue: textPrimary,
      rowMuted: textTertiary,
      rowDivider: color.border,
      chevron: textTertiary,
      screenBackground: color.background.color,
    },
  }
}
