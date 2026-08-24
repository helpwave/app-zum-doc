import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  formatMessageTime,
  toAppLocale,
  type StructuredCardMessage,
} from "@app-zum-doc/utils/api"
import {
  Button,
  ChatMessageBubble,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
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
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const tonalPrimary = theme.semantics.coloringColorVariant({colorPair: theme.colors.primary, variant: "tonal"})
  const showActions =
    !message.selectedActionId && message.actions && message.actions.length > 0

  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={formatMessageTime(message.time, locale)}
    >
      <View style={{flexDirection: "row", alignItems: "center", gap: theme.spacing.md}}>
        <View style={{...theme.semantics.container.sm, backgroundColor: tonalPrimary.color}}>
          <ThemedIcon color={tonalPrimary.onColor} icon={CalendarDays} size={theme.icongraphy.sizes.md}/>
        </View>
        <View style={{flexDirection: "column", gap: theme.spacing.xs}}>
          <ThemedText style={{fontWeight: theme.fontWeights.semibold}}>{message.title}</ThemedText>
          <ThemedText appearance="description">{message.subtitle}</ThemedText>
        </View>
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <Text
          style={{
            ...theme.typography.heading.md,
            fontWeight: theme.fontWeights.bold,
            color: colors.title,
          }}
        >
          {message.primary}
        </Text>
        <Text style={{ ...theme.typography.body.sm, color: colors.detail }}>
          {message.detail}
        </Text>
      </View>
      {showActions && (
        <View style={{flexDirection: "row", alignItems: "flex-end"}}>
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
    </ChatMessageBubble>
  )
}
