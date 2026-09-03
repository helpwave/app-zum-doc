import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { IconButton, ThemedText } from "@helpwave/hightide-native/components"
import { ColorPairToken } from "@helpwave/hightide-design/theme-tokens"
import { ContentThemeOverrideProvider } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import type { ReactNode } from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type AppBarProps = ViewProps & {
  title?: ReactNode,
  leading?: ReactNode,
  trailing?: ReactNode,
  noDefaultBackNavigation?: boolean,
  leadingContainerStyle?: StyleProp<ViewStyle>,
  trailingContainerStyle?: StyleProp<ViewStyle>,
  color?: ColorPairToken 
}

export function AppBar({
  title,
  leading,
  trailing,
  noDefaultBackNavigation = false,
  leadingContainerStyle,
  trailingContainerStyle,
  style,
  color: colorOverride,
  children,
  ...viewProps
}: AppBarProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const showBack = !noDefaultBackNavigation && router.canGoBack()
  const insets = useSafeAreaInsets()

  const color = colorOverride ?? theme.colors.surface
  const inverseColor: ColorPairToken = {
    color: color.onColor,
    onColor: color.color
  }

  return (
    <View
      {...viewProps} 
      style={[
        {
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingTop: insets.top,
          backgroundColor: color.color,
        },
        style
      ]}
    >
      <ContentThemeOverrideProvider 
        foreground={color.onColor}
        background={color.color}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: theme.semantics.touchTargetSize({}) + 2 * theme.padding.md,
            justifyContent: "space-between",
            ...StyleAdapterUtils.padding({
              "type": "logicalAxis",
              inline: theme.padding.lg,
              block: theme.padding.md,
            }),
          }}
        >
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                zIndex: 1,
              },
              leadingContainerStyle,
            ]}
          >
            {showBack ? (
              <IconButton
                icon={ChevronLeft}
                variant="foreground"
                color={inverseColor}
                accessibilityRole="button"
                accessibilityLabel={t("back")}
                onPress={() => {
                  router.back()
                }}
              />
            ) : null}
            {leading}
          </View>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              minHeight: theme.semantics.touchTargetSize({}),
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: theme.semantics.control.md.size,
            }}
          >
            {typeof title === "string" || typeof title === "number" ? (
              <ThemedText
                numberOfLines={1}
                style={{
                  ...theme.typography.heading.md,
                  textAlign: "center",
                }}
              >
                {title}
              </ThemedText>
            ) : (
              title
            )}
          </View>
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                zIndex: 1,
              },
              trailingContainerStyle,
            ]}
          >
            {trailing}
          </View>
        </View>
        {children}
      </ContentThemeOverrideProvider>
    </View>
  )
}
