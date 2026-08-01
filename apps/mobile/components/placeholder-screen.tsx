import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { ChevronLeft } from "lucide-react-native"
import type { ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type PlaceholderScreenProps = {
  title: string
  description?: string
  onBack: () => void
  children?: ReactNode
}

export function PlaceholderScreen({
  title,
  description,
  onBack,
  children,
}: PlaceholderScreenProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const headerColors = theme.components.screenHeader
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 14,
            borderBottomColor: headerColors.border,
            backgroundColor: headerColors.background,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={onBack}
          hitSlop={8}
          style={styles.side}
        >
          <ChevronLeft
            size={24}
            color={theme.semantic.primary}
            strokeWidth={2.2}
          />
        </Pressable>
        <Text style={[styles.title, { color: headerColors.title }]}>
          {title}
        </Text>
        <View style={styles.side} />
      </View>
      <View style={styles.body}>
        {children ?? (
          <Text
            style={[
              styles.description,
              { color: theme.semantic.textSecondary },
            ]}
          >
            {description ?? t("placeholderComingSoon")}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: azdLayout.space[4],
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: {
    width: 32,
    alignItems: "flex-start",
  },
  title: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 17,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: azdLayout.space[6],
  },
  description: {
    fontFamily: azdLayout.font.display,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
})
