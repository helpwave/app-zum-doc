import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  type StructuredCardMessage,
} from "@app-zum-doc/utils/api"
import {
  Button,
  ChatMessageBubble,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { CalendarDays } from "lucide-react-native"
import { View } from "react-native"

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
  const tonalPrimary = theme.semantics.coloringColorVariant({colorPair: theme.colors.primary, variant: "tonal"})
  const showActions =
    !message.selectedActionId && message.actions && message.actions.length > 0

  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={message.time}
    >
      <View style={{flexDirection: "column", gap: theme.spacing.md}}>
        <View style={{flexDirection: "row", alignItems: "center", gap: theme.spacing.md}}>
          <View 
            style={{
              backgroundColor: tonalPrimary.color,
              borderRadius: theme.borderRadius.md,
              height: theme.semantics.container.md.size,
              width: theme.semantics.container.md.size,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemedIcon color={tonalPrimary.onColor} icon={CalendarDays} size={theme.icongraphy.sizes.md}/>
          </View>
          <View style={{flexDirection: "column", gap: theme.spacing.xs}}>
            <ThemedText style={{...theme.typography.body.lg, fontWeight: theme.fontWeights.semibold}}>{message.title}</ThemedText>
            <ThemedText appearance="description">{message.subtitle}</ThemedText>
          </View>
        </View>
        <View style={{ gap: theme.spacing.xs }}>
          <ThemedText
            style={{
              ...theme.typography.body.md,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            {message.primary}
          </ThemedText>
          <ThemedText appearance="description" style={{ ...theme.typography.body.sm }}>
            {message.detail}
          </ThemedText>
        </View>
        {showActions && (
          <View style={{flexDirection: "row", alignItems: "flex-end", gap: theme.spacing.md }}>
            {message.actions!.map((action) => {
              const isMainAction = action.id === message.mainActionId

              return (
                <Button
                  key={action.id}
                  color={theme.colors.primary}
                  variant={isMainAction ? "filled" : "tonal"}
                  disabled={isActionPending}
                  onPress={() => onAction?.(action.id)}
                  style={{ flex: 1 }}
                >
                  {action.label}
                </Button>
              )
            })}
          </View>
        )}
      </View>
    </ChatMessageBubble>
  )
}
