import { useAzdTheme } from "@/hooks/useAzdTheme";
import { ThemedText } from "@helpwave/hightide-native/components";
import type { ReactNode } from "react";
import { View, ViewProps } from "react-native";

export interface SectionProps extends ViewProps {
    title: string
    trailing?: ReactNode
}

export const Section = ({title, trailing, children, ...restProps}: SectionProps) => {
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
                    style={{...theme.typography.body.md, fontWeight: theme.fontWeights.bold}} 
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