import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Button, IconButton } from "@helpwave/hightide-native/components"
import { ChevronLeft } from "lucide-react-native"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type StepperProps = {
  stepCount: number
  currentStep: number
  onBack: () => void
  onForward: () => void
  forwardLabel: string
  backAccessibilityLabel?: string
  forwardDisabled?: boolean
  forwardIsProcessing?: boolean
  backDisabled?: boolean
}

export function Stepper({
  stepCount,
  currentStep,
  onBack,
  onForward,
  forwardLabel,
  backAccessibilityLabel,
  forwardDisabled = false,
  forwardIsProcessing = false,
  backDisabled = false,
}: StepperProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const steps = Array.from({ length: stepCount }, (_, index) => index)

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: theme.spacing.md + insets.left,
        paddingRight:  theme.spacing.md + insets.right,
        paddingTop: theme.spacing.md,
      }}
    >
      <IconButton
        icon={ChevronLeft}
        variant="foreground"
        disabled={backDisabled}
        accessibilityLabel={backAccessibilityLabel ?? t("back")}
        onPress={onBack}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        {steps.map((index) => {
          const isCurrent = index === currentStep
          return (
            <View
              key={index}
              style={{
                width: theme.icongraphy.sizes.xs / 2,
                height: theme.icongraphy.sizes.xs / 2,
                borderRadius: 9999,
                backgroundColor: isCurrent
                  ? theme.colors.primary.color
                  : theme.colors.neutral.color,
              }}
            />
          )
        })}
      </View>
      <Button
        variant="foreground"
        disabled={forwardDisabled}
        isProcessing={forwardIsProcessing}
        onPress={onForward}
      >
        {forwardLabel}
      </Button>
    </View>
  )
}
