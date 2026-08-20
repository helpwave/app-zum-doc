import { useAzdTheme } from "@/hooks/useAzdTheme";
import { ThemedText } from "@helpwave/hightide-native/components";
import { View, ViewProps } from "react-native";

export interface SectionProps extends ViewProps {
    title: string
}

export const Section = ({title, children, ...restProps}: SectionProps) => {
    const { theme } = useAzdTheme()
    return (
        <View {...restProps} style={[{ gap: theme.spacing.md }, restProps.style]}>
            <ThemedText 
                style={{...theme.typography.body.md, fontWeight: theme.fontWeights.bold}} 
                appearance="description"
            >
                {title}
            </ThemedText>
            {children}
        </View>
    )
}