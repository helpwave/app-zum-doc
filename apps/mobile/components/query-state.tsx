import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Button, Card, ThemedText } from "@helpwave/hightide-native/components"
import { RotateCcw } from "lucide-react-native"
import type { ReactNode } from "react"
import {
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"

type QueryStateProps = {
  isPending: boolean
  isError: boolean
  error?: Error | null
  onRetry?: () => void
  loadingLabel?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function QueryState({
  isPending,
  isError,
  error,
  onRetry,
  loadingLabel,
  children,
  style,
}: QueryStateProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const resolvedLoadingLabel = loadingLabel ?? t("loadingChats")
  const centerStyle = {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md + theme.spacing.sm,
  }

  if (isPending) {
    return (
      <View style={[centerStyle, style]}>
        <Card 
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: theme.padding.xl,
            gap: theme.spacing.md
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary.color} />
          <ThemedText
            style={{
              ...theme.typography.body.sm,
              marginTop: theme.spacing.md,
            }}
          >
            {resolvedLoadingLabel}
          </ThemedText>
        </Card>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[centerStyle, style]}>
        <Card
          style={{
            alignItems: "flex-start",
            padding: theme.padding.xl,
            gap: theme.spacing.md
          }}
        >
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            {t("errorTitle")}
          </ThemedText>
          <ThemedText 
            appearance="description"
            style={{
              ...theme.typography.body.sm,
              marginBottom: theme.spacing.md,
            }}
          >
            {error?.message ?? t("errorUnknown")}
          </ThemedText>
          {onRetry ? (
            <Button size="md" onPress={onRetry} leadingIcon={RotateCcw} style={{alignSelf: "flex-end"}}>
              {t("retry")}
            </Button>
          ) : null}
        </Card>
      </View>
    )
  }

  return <>{children}</>
}
