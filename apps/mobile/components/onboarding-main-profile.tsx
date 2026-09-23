import { AppBar } from "@/components/app-bar"
import {
  ProfileFormFields,
  isProfileFormReady,
  type ProfileFormValues,
} from "@/components/profile-form-fields"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useKeyBoard } from "@/hooks/useKeyBoardIsVisible"
import { Button, IconButton, ThemedText } from "@helpwave/hightide-native/components"
import { ChevronLeft } from "lucide-react-native"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type OnboardingMainProfileProps = {
  values: ProfileFormValues
  onChange: (values: ProfileFormValues) => void
  onBack: () => void
  onContinue: () => void
  onRestoreBackup?: () => void
}

export function OnboardingMainProfile({
  values,
  onChange,
  onBack,
  onContinue,
  onRestoreBackup,
}: OnboardingMainProfileProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const canContinue = isProfileFormReady(values)
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
        title={t("onboardingMainProfileTitle")}
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
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileFormFields values={values} onChange={onChange} />
      </ScrollView>
      <View
        style={{
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg + insets.bottom,
        }}
      >
        {onRestoreBackup ? (
          <View style={{ gap: theme.spacing.sm }}>
            <ThemedText
              appearance="description"
              style={{
                ...theme.typography.body.sm,
                textAlign: "center",
              }}
            >
              {t("onboardingBackupEntryHint")}
            </ThemedText>
            <Button variant="tonal" onPress={onRestoreBackup}>
              {t("onboardingRestoreBackup")}
            </Button>
          </View>
        ) : null}
        <Button
          disabled={!canContinue}
          onPress={onContinue}
        >
          {t("onboardingNext")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
