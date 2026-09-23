import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Button, ThemedText } from "@helpwave/hightide-native/components"
import { Image } from "expo-image"
import { useWindowDimensions, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type OnboardingWelcomeProps = {
  isContinuing: boolean
  onNext: () => void
}

export function OnboardingWelcome({ isContinuing, onNext }: OnboardingWelcomeProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const dimension = useWindowDimensions()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
        paddingTop: insets.top + theme.spacing.xl,
        paddingBottom: insets.bottom + theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", gap: theme.spacing.xl, top: dimension.height * 0.1 }}>
        <Image
          source={require("../assets/images/azd-logo.png")}
          contentFit="contain"
          style={{
            width: 96,
            height: 96,
          }}
        />
        <ThemedText
          style={{
            ...theme.typography.heading.lg,
            fontWeight: theme.fontWeights.bold,
            textAlign: "center",
          }}
        >
          {t("onboardingWelcomeTitle")}
        </ThemedText>
        <ThemedText
          appearance="description"
          style={{
            ...theme.typography.body.md,
            textAlign: "center",
          }}
        >
          {t("onboardingWelcomeDisclaimer")}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }} />
      <Button
        isProcessing={isContinuing}
        onPress={onNext}
      >
        {t("onboardingNext")}
      </Button>
    </View>
  )
}
