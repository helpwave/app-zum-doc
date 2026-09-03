import { SelectionSheet } from "@/components/selection-sheet"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  patientProfileFullName,
  type PatientProfile,
} from "@app-zum-doc/utils/api"
import {
  ListActionItem,
  ThemedIcon,
  ThemedText
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { Image } from "expo-image"
import { GlobeIcon, SunMoonIcon } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"

const azdLogo = require("../assets/images/azd-logo.png")

type ProfileHeaderProps = {
  profile: PatientProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { theme } = useAzdTheme()

  return (
    <View
      style={{
        alignItems: "center",
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.lg + theme.spacing.sm,
      }}
    >
      <Image
        source={azdLogo}
        style={{
          width: theme.semantics.container.md.size * 2,
          height: theme.semantics.container.md.size * 2,
        }}
        contentFit="contain"
      />
      <Text
        style={{
          ...theme.typography.heading.lg,
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.background.onColor,
          marginTop: theme.spacing.md,
        }}
      >
        {patientProfileFullName(profile)}
      </Text>
    </View>
  )
}


export function ThemeModeSetting() {
  const t = useAppTranslation()
  const { theme, themeMode, preferredThemeMode, setTheme, supportedThemes } =
    useAzdTheme()
  const { locale } = useLocalization()
  const [isOpen, setIsOpen] = useState(false)
  const selectedPreference = preferredThemeMode ?? "system"
  const options = useMemo(
    () => [
      {
        id: "system",
        label: t("themeSystem"),
      },
      ...Object.keys(supportedThemes).map((mode) => ({
        id: mode,
        label:
          supportedThemes[mode]?.nameTranslations[locale]
          ?? supportedThemes[mode]?.nameTranslations["en-US"]
          ?? mode,
      })),
    ],
    [locale, supportedThemes, t],
  )
  const currentName =
    preferredThemeMode == null
      ? t("themeSystem")
      : supportedThemes[themeMode]?.nameTranslations[locale]
        ?? supportedThemes[themeMode]?.nameTranslations["en-US"]
        ?? themeMode

  return (
    <>
      <ListActionItem
        title={t("themeMode")}
        leading={<ThemedIcon icon={SunMoonIcon}/>}
        onPress={() => {
          setIsOpen(true)
        }}
        trailing={
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.sm,
              fontFamily: theme.fontFamilies.default,
            }}
          >
            {currentName}
          </ThemedText>
        }
      />
      <SelectionSheet
        visible={isOpen}
        title={t("themeMode")}
        options={options}
        value={selectedPreference}
        onChange={(nextPreference) => {
          setTheme(nextPreference === "system" ? null : nextPreference)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
        onDone={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

export function LocaleSetting() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const { locale, setLocale, supportedLocales } = useLocalization()
  const [isOpen, setIsOpen] = useState(false)
  const options = useMemo(
    () =>
      Object.keys(supportedLocales).map((localeKey) => ({
        id: localeKey,
        label: supportedLocales[localeKey]?.localName ?? localeKey,
      })),
    [supportedLocales],
  )
  const currentName =
    supportedLocales[locale]?.localName ?? locale

  return (
    <>
      <ListActionItem
        title={t("language")}
        leading={<ThemedIcon icon={GlobeIcon}/>}
        onPress={() => {
          setIsOpen(true)
        }}
        trailing={
          <Text
            style={{
              ...theme.typography.body.sm,
              fontFamily: theme.fontFamilies.default,
              color: theme.semantics.asDescription({ colorPair: theme.colors.surface }),
            }}
          >
            {currentName}
          </Text>
        }
      />
      <SelectionSheet
        visible={isOpen}
        title={t("language")}
        options={options}
        value={locale}
        onChange={(nextLocale) => {
          if (nextLocale == null) {
            return
          }
          setLocale(nextLocale)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
        onDone={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}
