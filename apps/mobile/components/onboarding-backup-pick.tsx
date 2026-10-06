import { AppBar } from "@/components/app-bar"
import { onboardingProfileDateLabel } from "@/components/onboarding-profile-date"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  patientProfileFullName,
  toAppLocale,
  type AppOnboardingProfileInput,
} from "@app-zum-doc/utils/api"
import { Button, Card, IconButton, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { Check, ChevronLeft } from "lucide-react-native"
import { useState } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type BackupMainChoice = "new" | string

type OnboardingBackupPickProps = {
  profiles: AppOnboardingProfileInput[]
  onBack: () => void
  onContinue: (choice: BackupMainChoice) => void
}

export function OnboardingBackupPick({
  profiles,
  onBack,
  onContinue,
}: OnboardingBackupPickProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const [choice, setChoice] = useState<BackupMainChoice | null>(null)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar
        title={t("onboardingBackupPickTitle")}
        noDefaultBackNavigation
        leading={(
          <IconButton
            icon={ChevronLeft}
            variant="foreground"
            accessibilityLabel={t("back")}
            onPress={onBack}
          />
        )}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => {
            setChoice("new")
          }}
        >
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                padding: theme.spacing.md,
              }}
            >
              <ThemedText
                style={{
                  flex: 1,
                  ...theme.typography.body.md,
                  fontWeight: theme.fontWeights.semibold,
                  color: choice === "new" ? theme.colors.primary.color : undefined,
                }}
              >
                {t("onboardingBackupCreateNew")}
              </ThemedText>
              {choice === "new" ? (
                <Check color={theme.colors.primary.color} size={theme.icongraphy.sizes.md} />
              ) : null}
            </View>
          </Card>
        </Pressable>
        {profiles.map((profile) => {
          const selected = choice === profile.id
          return (
            <Pressable
              key={profile.id}
              onPress={() => {
                setChoice(profile.id)
              }}
            >
              <Card>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <ThemedText
                      style={{
                        ...theme.typography.body.md,
                        fontWeight: theme.fontWeights.semibold,
                        color: selected ? theme.colors.primary.color : undefined,
                      }}
                    >
                      {patientProfileFullName(profile)}
                    </ThemedText>
                    <ThemedText appearance="description" style={theme.typography.body.sm}>
                      {onboardingProfileDateLabel(profile.dateOfBirth, locale)}
                    </ThemedText>
                  </View>
                  {selected ? (
                    <Check color={theme.colors.primary.color} size={theme.icongraphy.sizes.md} />
                  ) : null}
                </View>
              </Card>
            </Pressable>
          )
        })}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg + insets.bottom,
        }}
      >
        <Button
          disabled={choice == null}
          onPress={() => {
            if (choice != null) {
              onContinue(choice)
            }
          }}
        >
          {t("onboardingNext")}
        </Button>
      </View>
    </View>
  )
}
