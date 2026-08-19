import type {
  ColorPaletteBasicToken,
  ColorToken,
  HightidePrimitiveTokens,
} from "@helpwave/hightide-design/primitive-tokens"
import type { ColorPairToken, ThemeTokens } from "@helpwave/hightide-design/theme-tokens"

export type AzdPrimitiveTokens = Omit<HightidePrimitiveTokens, "color"> & {
  color: HightidePrimitiveTokens["color"] & {
    palettes: HightidePrimitiveTokens["color"]["palettes"] & {
      teal: ColorPaletteBasicToken
    }
  }
}

export type AzdScreenComponentTokens = {
  background: ColorToken
}

export type AzdTabBarComponentTokens = {
  background: ColorToken
  border: ColorToken
  inactive: ColorToken
  activeBackground: ColorToken
  activeForeground: ColorToken
}

export type AzdHomeSectionsComponentTokens = {
  heroStart: ColorToken
  heroEnd: ColorToken
  heroTitle: ColorToken
  searchBackground: ColorToken
  searchIcon: ColorToken
  searchPlaceholder: ColorToken
  actionBackground: ColorToken
  actionText: ColorToken
  actionIcon: ColorToken
  sectionTitle: ColorToken
  showAll: ColorToken
  cardBackground: ColorToken
  doctorName: ColorToken
  doctorSpecialty: ColorToken
  doctorMeta: ColorToken
  openDot: ColorToken
  closedDot: ColorToken
  avatarBackground: ColorToken
  avatarText: ColorToken
  requestDoctor: ColorToken
  requestTitle: ColorToken
  statusWarningBackground: ColorToken
  statusWarningText: ColorToken
  statusWarningDot: ColorToken
  statusSuccessBackground: ColorToken
  statusSuccessText: ColorToken
  statusSuccessDot: ColorToken
  kindTagBackground: ColorToken
  kindTagText: ColorToken
  screenBackground: ColorToken
}

export type AzdScreenHeaderComponentTokens = {
  background: ColorToken
  border: ColorToken
  title: ColorToken
}

export type AzdSearchFieldComponentTokens = {
  background: ColorToken
  icon: ColorToken
  text: ColorToken
  placeholder: ColorToken
}

export type AzdQueryStateComponentTokens = {
  background: ColorToken
  spinner: ColorToken
  loadingText: ColorToken
  title: ColorToken
  description: ColorToken
}

export type AzdProfileSectionsComponentTokens = {
  name: ColorToken
  meta: ColorToken
  icon: ColorToken
  iconDanger: ColorToken
}

export type AzdComposerComponentTokens = {
  errorText: ColorToken
  errorBackground: ColorToken
}

export type AzdStructuredCardComponentTokens = {
  icon: ColorToken
  title: ColorToken
  detail: ColorToken
}

export type AzdDoctorDetailComponentTokens = {
  heroStart: ColorToken
  heroEnd: ColorToken
  heroIcon: ColorToken
  cardBackground: ColorToken
  cardBorder: ColorToken
  name: ColorToken
  specialty: ColorToken
  openDot: ColorToken
  closedDot: ColorToken
  statusText: ColorToken
  phoneText: ColorToken
  ctaBackground: ColorToken
  ctaText: ColorToken
  sectionLabel: ColorToken
  rowBackground: ColorToken
  rowLabel: ColorToken
  rowValue: ColorToken
  rowMuted: ColorToken
  rowDivider: ColorToken
  chevron: ColorToken
  screenBackground: ColorToken
}

export type AzdComponentTokens = {
  screen: AzdScreenComponentTokens
  tabBar: AzdTabBarComponentTokens
  homeSections: AzdHomeSectionsComponentTokens
  screenHeader: AzdScreenHeaderComponentTokens
  searchField: AzdSearchFieldComponentTokens
  queryState: AzdQueryStateComponentTokens
  profileSections: AzdProfileSectionsComponentTokens
  composer: AzdComposerComponentTokens
  structuredCard: AzdStructuredCardComponentTokens
  doctorDetail: AzdDoctorDetailComponentTokens
}

export type AzdThemeTokens = ThemeTokens & {
  color: ThemeTokens["color"] & {
    prescription: ColorPairToken,
    referral: ColorPairToken,
    appointment: ColorPairToken,
  },
  componentColors: AzdComponentTokens
}
