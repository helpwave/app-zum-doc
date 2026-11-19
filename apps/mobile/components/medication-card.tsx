import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { MedicationSize, Substance } from "@app-zum-doc/utils/api"
import { Card, ThemedText } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import { View } from "react-native"

type MedicationCardProps = {
  name: string
  size: MedicationSize
  ingredient: Substance[]
  trailing?: ReactNode
}

export function MedicationCard({
  name,
  size,
  ingredient,
  trailing,
}: MedicationCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <Card
      style={{
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            flex: 1,
            gap: theme.spacing.xs,
          }}
        >
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
              color: theme.colors.primary.color,
            }}
          >
            {name}
          </ThemedText>
          <ThemedText style={theme.typography.body.md}>
            {t("medicationSize", { size })}
          </ThemedText>
        </View>
        {trailing}
      </View>
      {ingredient.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {ingredient.map((substance) => (
            <View
              key={substance.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.colors.neutral.color,
              }}
            >
              <ThemedText
                style={{
                  ...theme.typography.body.sm,
                  fontWeight: theme.fontWeights.semibold,
                }}
              >
                {substance.name}
              </ThemedText>
              <ThemedText
                appearance="description"
                style={theme.typography.body.sm}
              >
                {substance.strength}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  )
}
