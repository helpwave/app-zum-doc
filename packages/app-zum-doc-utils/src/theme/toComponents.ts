import type { ToComponentsArgs } from "@helpwave/hightide-design/tokens"
import { toHightideComponentTokens } from "@helpwave/hightide-design/tokens"
import type {
  AzdComponentTokens,
  AzdPrimitiveTokens,
  AzdSemanticTokens,
} from "./types"

export function toAzdComponents({
  themeName,
  primitiveTokens,
  semanticTokens,
}: ToComponentsArgs<AzdPrimitiveTokens, AzdSemanticTokens>): AzdComponentTokens {
  const base = toHightideComponentTokens({
    themeName,
    primitiveTokens,
    semanticTokens,
  })
  const semantic = semanticTokens
  const teal = primitiveTokens.teal

  return {
    ...base,
    screen: {
      background: semantic.background,
    },
    tabBar: {
      background: semantic.surface,
      border: base.divider,
      inactive: semantic.textTertiary,
      activeBackground: semantic.primary,
      activeForeground: semantic.onPrimary,
    },
    homeSections: {
      heroStart: teal.value[900],
      heroEnd: teal.value[500],
      heroTitle: "#FFFFFF" as const,
      searchBackground: semantic.surface,
      searchIcon: semantic.textTertiary,
      searchPlaceholder: semantic.placeholder,
      actionBackground: semantic.surface,
      actionText: semantic.textPrimary,
      actionIcon: semantic.textPrimary,
      sectionTitle: semantic.primary,
      showAll: semantic.textSecondary,
      cardBackground: semantic.surface,
      doctorName: semantic.textPrimary,
      doctorSpecialty: semantic.textTertiary,
      doctorMeta: semantic.textTertiary,
      openDot: semantic.primary,
      closedDot: semantic.textTertiary,
      avatarBackground: teal.value[100],
      avatarText: semantic.primary,
      requestDoctor: semantic.textTertiary,
      requestTitle: semantic.textPrimary,
      statusWarningBackground: "#C9A22726" as const,
      statusWarningText: "#9A7B1E" as const,
      statusWarningDot: "#C9A227" as const,
      statusSuccessBackground: "#0579861A" as const,
      statusSuccessText: semantic.primary,
      statusSuccessDot: semantic.primary,
      kindTagBackground: semantic.primary,
      kindTagText: "#FFFFFF" as const,
      screenBackground: semantic.background,
    },
    screenHeader: {
      background: semantic.surface,
      border: base.divider,
      title: semantic.primary,
    },
    searchField: {
      background: semantic.background,
      icon: semantic.textTertiary,
      text: semantic.textPrimary,
      placeholder: semantic.placeholder,
    },
    queryState: {
      background: semantic.surface,
      spinner: semantic.primary,
      loadingText: semantic.textSecondary,
      title: semantic.textPrimary,
      description: semantic.textSecondary,
    },
    profileSections: {
      name: semantic.textPrimary,
      meta: semantic.textSecondary,
      icon: semantic.primary,
      iconDanger: semantic.negative,
    },
    composer: {
      errorText: semantic.negative,
      errorBackground: semantic.surface,
    },
    structuredCard: {
      icon: semantic.primary,
      title: semantic.textPrimary,
      detail: semantic.textSecondary,
    },
    doctorDetail: {
      heroStart: teal.value[900],
      heroEnd: teal.value[500],
      heroIcon: "#FFFFFF" as const,
      cardBackground: semantic.surface,
      cardBorder: base.outlineVariant,
      name: semantic.textPrimary,
      specialty: semantic.textTertiary,
      openDot: semantic.primary,
      closedDot: semantic.textTertiary,
      statusText: semantic.textPrimary,
      phoneText: semantic.textPrimary,
      ctaBackground: semantic.surface,
      ctaText: semantic.primary,
      sectionLabel: semantic.textSecondary,
      rowBackground: semantic.surface,
      rowLabel: semantic.textPrimary,
      rowValue: semantic.textPrimary,
      rowMuted: semantic.textTertiary,
      rowDivider: base.divider,
      chevron: semantic.textTertiary,
      screenBackground: semantic.background,
    },
  }
}
