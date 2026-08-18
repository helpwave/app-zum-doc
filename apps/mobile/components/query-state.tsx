import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { Button } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import {
  ActivityIndicator,
  Text,
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
  const colors = theme.components.queryState
  const resolvedLoadingLabel = loadingLabel ?? t("loadingChats")
  const centerStyle = {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md + theme.spacing.sm,
    backgroundColor: colors.background,
  }

  if (isPending) {
    return (
      <View style={[centerStyle, style]}>
        <ActivityIndicator size="large" color={colors.spinner} />
        <Text
          style={{
            ...theme.typography.body.sm,
            color: colors.loadingText,
            marginTop: theme.spacing.md,
          }}
        >
          {resolvedLoadingLabel}
        </Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[centerStyle, style]}>
        <Text
          style={{
            ...theme.typography.heading.md,
            fontWeight: theme.typography.fontWeights.bold,
            textAlign: "center",
            color: colors.title,
          }}
        >
          {t("errorTitle")}
        </Text>
        <Text
          style={{
            ...theme.typography.body.sm,
            textAlign: "center",
            color: colors.description,
            marginBottom: theme.spacing.md,
          }}
        >
          {error?.message ?? t("errorUnknown")}
        </Text>
        {onRetry ? (
          <Button size="md" onPress={onRetry}>
            {t("retry")}
          </Button>
        ) : null}
      </View>
    )
  }

  return <>{children}</>
}
