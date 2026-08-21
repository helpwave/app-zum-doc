import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedText } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import { View } from "react-native"

type LabeledFieldProps = {
  label: string
  trailing?: ReactNode
  children: ReactNode
}

export function LabeledField({ label, trailing, children }: LabeledFieldProps) {
  const { theme } = useAzdTheme()

  return (
    <View style={{ flex: 1, gap: theme.spacing.sm }}>
      <ThemedText
        appearance="description"
        style={theme.typography.body.sm}
      >
        {label}
      </ThemedText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>
        {trailing}
      </View>
    </View>
  )
}
