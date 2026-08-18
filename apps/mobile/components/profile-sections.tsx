import { SelectionSheet } from "@/components/selection-sheet"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { PatientProfile } from "@app-zum-doc/utils/api"
import {
    Avatar,
    ListActionItem,
    ThemedIcon
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { GlobeIcon, SunMoonIcon } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"

type ProfileHeaderProps = {
  profile: PatientProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.profileSections

  return (
    <View
      style={{
        alignItems: "center",
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.lg + theme.spacing.sm,
      }}
    >
      <Avatar
        name={profile.fullName}
        size="lg"
      />
      <Text
        style={{
          ...theme.typography.heading.lg,
          fontWeight: theme.typography.fontWeights.bold,
          color: colors.name,
          marginTop: theme.spacing.md,
        }}
      >
        {profile.fullName}
      </Text>
      <Text
        style={{
          ...theme.typography.body.sm,
          fontFamily: theme.typography.fontFamilies.default,
          textAlign: "center",
          paddingHorizontal: theme.spacing.lg,
          color: colors.meta,
        }}
      >
        geb. {profile.dateOfBirth} · Vers.-Nr. {profile.insuranceNumber} ·{" "}
        {profile.insuranceType}
      </Text>
    </View>
  )
}


export function ThemeModeSetting() {
  const t = useAppTranslation()
  const { theme, themeMode, preferredThemeMode, setTheme, supportedThemes } =
    useAzdTheme()
  const { locale } = useLocalization()
  const colors = theme.components.profileSections
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
          <Text
            style={{
              ...theme.typography.body.sm,
              fontFamily: theme.typography.fontFamilies.default,
              color: colors.meta,
            }}
          >
            {currentName}
          </Text>
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
  const colors = theme.components.profileSections
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
              fontFamily: theme.typography.fontFamilies.default,
              color: colors.meta,
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
        onChange={setLocale}
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
