import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedText } from "@helpwave/hightide-native/components"
import { useEffect } from "react"
import { Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type SnackbarProps = {
  message: string | null
  onDismiss: () => void
}

export function Snackbar({ message, onDismiss }: SnackbarProps) {
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!message) {
      return
    }

    const timeout = setTimeout(() => {
      onDismiss()
    }, 4000)

    return () => {
      clearTimeout(timeout)
    }
  }, [message, onDismiss])

  if (!message) {
    return null
  }

  return (
    <Pressable
      accessibilityRole="alert"
      onPress={onDismiss}
      style={{
        position: "absolute",
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: insets.bottom + theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md + theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.negative.color,
      }}
    >
      <ThemedText
        style={{
          ...theme.typography.body.md,
          color: theme.colors.negative.onColor,
        }}
      >
        {message}
      </ThemedText>
    </Pressable>
  )
}
