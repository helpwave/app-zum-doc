import { Button } from "@helpwave/hightide-native/components"
import { useAppTranslation } from "app-zum-doc-utils/hooks"
import type { ReactNode } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { azd } from "@/theme/azd-tokens"

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
  const resolvedLoadingLabel = loadingLabel ?? t("loadingChats")

  if (isPending) {
    return (
      <View style={[styles.center, style]}>
        <ActivityIndicator size="large" color={azd.green[600]} />
        <Text style={styles.loadingLabel}>{resolvedLoadingLabel}</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[styles.center, style]}>
        <Text style={styles.errorTitle}>{t("errorTitle")}</Text>
        <Text style={styles.errorBody}>
          {error?.message ?? t("errorUnknown")}
        </Text>
        {onRetry ? (
          <Button
            color="primary"
            coloringStyle="solid"
            size="md"
            onPress={onRetry}
            buttonStyle={() => ({
              backgroundColor: azd.green[600],
              borderRadius: azd.radius.pill,
              paddingHorizontal: azd.space[5],
              paddingVertical: azd.space[3],
            })}
            textStyle={() => ({
              color: "#FFFFFF",
              fontFamily: azd.font.display,
              fontWeight: "500",
            })}
          >
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
    paddingHorizontal: azd.space[6],
    gap: azd.space[3],
    backgroundColor: azd.bg.surface,
  },
  loadingLabel: {
    fontFamily: azd.font.display,
    fontSize: 14,
    color: azd.fg[5],
    marginTop: azd.space[2],
  },
  errorTitle: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 18,
    color: azd.fg[1],
    textAlign: "center",
  },
  errorBody: {
    fontFamily: azd.font.display,
    fontSize: 14,
    color: azd.fg[4],
    textAlign: "center",
    marginBottom: azd.space[2],
  },
})
