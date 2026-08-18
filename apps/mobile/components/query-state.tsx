import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { Button } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import {
  ActivityIndicator,
  StyleSheet,
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

  if (isPending) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background },
          style,
        ]}
      >
        <ActivityIndicator size="large" color={colors.spinner} />
        <Text style={[styles.loadingLabel, { color: colors.loadingText }]}>
          {resolvedLoadingLabel}
        </Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background },
          style,
        ]}
      >
        <Text style={[styles.errorTitle, { color: colors.title }]}>
          {t("errorTitle")}
        </Text>
        <Text style={[styles.errorBody, { color: colors.description }]}>
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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: azdLayout.space[6],
    gap: azdLayout.space[3],
  },
  loadingLabel: {
    fontFamily: azdLayout.font.display,
    fontSize: 14,
    marginTop: azdLayout.space[2],
  },
  errorTitle: {
    fontFamily: azdLayout.font.display,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  errorBody: {
    fontFamily: azdLayout.font.display,
    fontSize: 14,
    textAlign: "center",
    marginBottom: azdLayout.space[2],
  },
})
