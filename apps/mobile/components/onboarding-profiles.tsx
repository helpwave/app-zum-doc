import { AppBar } from "@/components/app-bar"
import { onboardingProfileDateLabel } from "@/components/onboarding-profile-date"
import {
  ProfileFormFields,
  emptyProfileFormValues,
  isProfileFormReady,
  type ProfileFormValues,
} from "@/components/profile-form-fields"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useKeyBoard } from "@/hooks/useKeyBoardIsVisible"
import {
  findInsuranceCompany,
  patientProfileFullName,
  toAppLocale,
  type AppOnboardingProfileInput,
} from "@app-zum-doc/utils/api"
import { Button, Card, IconButton, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { ChevronLeft, Trash } from "lucide-react-native"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type OnboardingProfilesProps = {
  profiles: AppOnboardingProfileInput[]
  isFinishing: boolean
  onProfilesChange: (profiles: AppOnboardingProfileInput[]) => void
  onBack: () => void
  onSkip: () => void
  onFinish: () => void
}

function draftFromForm(values: ProfileFormValues): AppOnboardingProfileInput {
  return {
    id: `profile-${Date.now()}`,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dateOfBirth: values.dateOfBirth,
    phoneNumber: values.phone.trim(),
    email: values.email.trim(),
    insurance: values.insuranceProviderId ?? "",
    insuranceNumber: values.insuranceNumber.trim(),
    medications: [],
  }
}

function ProfileValue({ label, value }: { label: string, value: string }) {
  const { theme } = useAzdTheme()
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <ThemedText appearance="description" style={theme.typography.body.sm}>
        {label}
      </ThemedText>
      <ThemedText style={theme.typography.body.md}>
        {value.length > 0 ? value : "—"}
      </ThemedText>
    </View>
  )
}

export function OnboardingProfiles({
  profiles,
  isFinishing,
  onProfilesChange,
  onBack,
  onSkip,
  onFinish,
}: OnboardingProfilesProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const insets = useSafeAreaInsets()
  const [isAdding, setIsAdding] = useState(false)
  const [draft, setDraft] = useState<ProfileFormValues>(emptyProfileFormValues)
  const canAdd = isProfileFormReady(draft)

  const addProfile = () => {
    if (!canAdd) {
      return
    }
    onProfilesChange([...profiles, draftFromForm(draft)])
    setDraft(emptyProfileFormValues())
    setIsAdding(false)
  }

  const { isVisible: isKeyboardVisible } = useKeyBoard()

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
    >
      <AppBar
        title={t("onboardingProfilesTitle")}
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
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {profiles.map((profile) => {
          const insuranceName = findInsuranceCompany(profile.insurance)?.name ?? profile.insurance
          return (
            <Card key={profile.id}>
              <View
                style={{
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.md,
                  }}
                >
                  <ThemedText
                    style={{
                      flex: 1,
                      ...theme.typography.body.md,
                      fontWeight: theme.fontWeights.semibold,
                    }}
                  >
                    {patientProfileFullName(profile)}
                  </ThemedText>
                  <IconButton
                    icon={Trash}
                    variant="foreground"
                    accessibilityLabel={t("onboardingDeleteUser")}
                    onPress={() => {
                      onProfilesChange(profiles.filter((item) => item.id !== profile.id))
                    }}
                  />
                </View>
                <ProfileValue
                  label={t("dateOfBirth")}
                  value={onboardingProfileDateLabel(profile.dateOfBirth, locale)}
                />
                <ProfileValue label={t("email")} value={profile.email} />
                <ProfileValue label={t("phoneNumber")} value={profile.phoneNumber} />
                <ProfileValue label={t("insuranceProvider")} value={insuranceName} />
                <ProfileValue label={t("insuranceNumberOptional")} value={profile.insuranceNumber} />
              </View>
            </Card>
          )
        })}

        {isAdding ? (
          <Card>
            <View style={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
              <ProfileFormFields values={draft} onChange={setDraft} />
              <Button
                disabled={!canAdd}
                onPress={addProfile}
                style={{ alignSelf: "flex-end" }}
              >
                {t("onboardingAdd")}
              </Button>
            </View>
          </Card>
        ) : null}

        <Button
          variant="tonal"
          onPress={() => {
            setIsAdding(true)
          }}
        >
          {t("onboardingAddUser")}
        </Button>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg + insets.bottom,
        }}
      >
        <Button
          variant="tonal"
          disabled={isFinishing}
          onPress={onSkip}
          style={{ flex: 1 }}
        >
          {t("onboardingSkip")}
        </Button>
        <Button
          isProcessing={isFinishing}
          onPress={onFinish}
          style={{ flex: 1 }}
        >
          {t("onboardingFinish")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
