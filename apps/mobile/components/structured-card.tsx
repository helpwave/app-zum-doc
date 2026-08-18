import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import type { StructuredCardMessage } from "@app-zum-doc/utils/api"
import {
  Button,
  ChatMessageBubble,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { CalendarDays } from "lucide-react-native"
import { Text, View } from "react-native"

type StructuredCardProps = {
  message: StructuredCardMessage
  onAction?: (actionId: string) => void
  isActionPending?: boolean
}

export function StructuredCard({
  message,
  onAction,
  isActionPending = false,
}: StructuredCardProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.structuredCard
  const tonalPrimary = theme.semantics.coloringColorVariant({colorPair: theme.colors.primary, variant: "tonal"})

  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={message.timeLabel}
    >
      <View style={{flexDirection: "row", alignItems: "center", gap: theme.spacing.md}}>
        <View style={{...theme.elements.container.sm, backgroundColor: tonalPrimary.color}}>
          <ThemedIcon color={tonalPrimary.onColor} icon={CalendarDays} size={theme.icongraphy.sizes.md}/>
        </View>
        <View style={{flexDirection: "column", gap: theme.spacing.xs}}>
          <ThemedText style={{fontWeight: theme.typography.fontWeights.semibold}}>{message.title}</ThemedText>
          <ThemedText appearance="description">{message.subtitle}</ThemedText>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontFamily: azdLayout.font.display,
            fontWeight: "700",
            fontSize: 17,
            color: colors.title,
          }}
        >
          {message.primary}
        </Text>
        <Text style={{ fontSize: 14, color: colors.detail }}>
          {message.detail}
        </Text>
      </View>
     { message.actions && message.actions.length > 0 && ( 
      <View style={{flexDirection: "row", alignItems: "flex-end"}}>
          {message.actions.map((action) => (
              <Button
                key={action.id}
                color={action.variant === "primary" ? theme.colors.primary : theme.colors.neutral}
                variant={action.variant === "primary" ? "filled" : "tonal"}
                disabled={isActionPending}
                onPress={() => onAction?.(action.id)}
                style={{ flex: 1 }}
              >
                {action.label}
              </Button>
            ))}
      </View>
    )}
    </ChatMessageBubble>
  )
}
