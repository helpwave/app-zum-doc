import { useAzdTheme } from "@/hooks/useAzdTheme";
import { ThemedText } from "@helpwave/hightide-native/components";
import type { ReactNode } from "react";
import { View, ViewProps, type StyleProp, type TextStyle } from "react-native";

export interface SectionProps extends ViewProps {
    title: string
    titleStyle?: StyleProp<TextStyle>
    trailing?: ReactNode
}

export const Section = ({title, titleStyle, trailing, children, ...restProps}: SectionProps) => {
  const { theme } = useAzdTheme()
  return (
    <View {...restProps} style={[{ gap: theme.spacing.md }, restProps.style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedText 
          style={[
            {...theme.typography.body.md, fontWeight: theme.fontWeights.bold},
            titleStyle,
          ]} 
          appearance="description"
        >
          {title}
        </ThemedText>
        {trailing}
      </View>
      {children}
    </View>
  )
}
