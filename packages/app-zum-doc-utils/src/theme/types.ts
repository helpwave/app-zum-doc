import type {
  ColorPaletteBasicToken,
  HightidePrimitiveTokens,
} from "@helpwave/hightide-design/primitive-tokens"
import type { ColorPairToken, ThemeTokens } from "@helpwave/hightide-design/theme-tokens"
import { PatientRequestStatus, PatientRequestType } from "../api/enums"

export type AzdPrimitiveTokens = Omit<HightidePrimitiveTokens, "color"> & {
  color: HightidePrimitiveTokens["color"] & {
    palettes: HightidePrimitiveTokens["color"]["palettes"] & {
      teal: ColorPaletteBasicToken
    }
  }
}

export type AzdComponentTokens = {
}

export type AzdThemeTokens = ThemeTokens & {
  color: ThemeTokens["color"] 
  & Record<PatientRequestType, ColorPairToken>
  & Record<PatientRequestStatus, ColorPairToken>,
  componentColors: AzdComponentTokens
}
