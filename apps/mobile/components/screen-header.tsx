import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"

type ScreenHeaderProps = {
  title: string
  trailing?: ReactNode
  children?: ReactNode
}

export function ScreenHeader({ title, trailing, children }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: azd.bg.surface,
    paddingHorizontal: azd.space[4],
    paddingTop: azd.space[5],
    paddingBottom: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 28,
    color: azd.green[600],
  },
})
