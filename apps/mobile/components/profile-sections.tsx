import { SelectionSheet } from "@/components/selection-sheet"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  formatInsuranceCompanyWithMaskedNumber,
  patientAgeYears,
  patientProfileFullName,
  type PatientProfileSummary,
} from "@app-zum-doc/utils/api"
import {
  Button,
  Card,
  IconButton,
  ListActionItem,
  ThemedIcon,
  ThemedText
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { GlobeIcon, Pencil, Pill, SunMoonIcon } from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native"

type ProfileUserCardProps = {
  profile: PatientProfileSummary
  onEdit: () => void
  onMedications: () => void
}

export function ProfileUserCard({ profile, onEdit, onMedications }: ProfileUserCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insuranceLabel = formatInsuranceCompanyWithMaskedNumber(profile.insurance)

  return (
    <Card
      style={{
        width: "100%",
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            {patientProfileFullName(profile)}
          </ThemedText>
          <ThemedText appearance="description" style={theme.typography.body.md}>
            {t("profileAge", { age: patientAgeYears(profile.dateOfBirth) })}
          </ThemedText>
          {insuranceLabel ? (
            <ThemedText appearance="description" style={theme.typography.body.md}>
              {insuranceLabel}
            </ThemedText>
          ) : null}
        </View>
        <IconButton
          icon={Pencil}
          size="sm"
          variant="foreground"
          accessibilityLabel={t("editPersonalData")}
          onPress={onEdit}
        />
      </View>
      <Button
        leadingIcon={Pill}
        variant="tonal"
        onPress={onMedications}
        style={{ alignSelf: "flex-start" }}
      >
        {t("medicationCount", { count: profile.medicationCount })}
      </Button>
    </Card>
  )
}

type ProfileUserCarouselProps = {
  profiles: PatientProfileSummary[]
  selectedProfileId: string
  onSelectProfile: (profileId: string) => Promise<void> | void
  onEdit: () => void
  onMedications: () => void
}

export function ProfileUserCarousel({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onEdit,
  onMedications,
}: ProfileUserCarouselProps) {
  const { theme } = useAzdTheme()
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)
  const pageWidth = Math.max(width, 1)
  const selectedIndex = Math.max(
    0,
    profiles.findIndex((profile) => profile.id === selectedProfileId),
  )

  useEffect(() => {
    if (profiles.length === 0) {
      return
    }
    scrollRef.current?.scrollTo({
      x: selectedIndex * pageWidth,
      animated: false,
    })
  }, [pageWidth, profiles.length, selectedIndex])

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (profiles.length === 0) {
      return
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth)
    const next = profiles[Math.min(Math.max(index, 0), profiles.length - 1)]
    if (next != null && next.id !== selectedProfileId) {
      void Promise.resolve(onSelectProfile(next.id)).catch(() => {
        scrollRef.current?.scrollTo({
          x: selectedIndex * pageWidth,
          animated: true,
        })
      })
    }
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentOffset={{ x: selectedIndex * pageWidth, y: 0 }}
      >
        {profiles.map((profile) => (
          <View
            key={profile.id}
            style={{
              width: pageWidth,
              paddingHorizontal: theme.spacing.lg,
            }}
          >
            <ProfileUserCard
              profile={profile}
              onEdit={onEdit}
              onMedications={onMedications}
            />
          </View>
        ))}
      </ScrollView>
      {profiles.length > 1 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.sm,
          }}
        >
          {profiles.map((profile) => {
            const isSelected = profile.id === selectedProfileId
            return (
              <View
                key={profile.id}
                style={{
                  width: isSelected ? theme.spacing.lg : theme.spacing.sm,
                  height: theme.spacing.sm,
                  borderRadius: 9999,
                  backgroundColor: isSelected
                    ? theme.colors.primary.color
                    : theme.colors.surface.color,
                }}
              />
            )
          })}
        </View>
      ) : null}
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
