import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type ScreenHeaderProps = {
  title: string
  trailing?: ReactNode
  children?: ReactNode
}

export function ScreenHeader({ title, trailing, children }: ScreenHeaderProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.screenHeader
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + azdLayout.space[5],
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: azdLayout.space[4],
    paddingBottom: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: azdLayout.font.display,
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 28,
  },
})
