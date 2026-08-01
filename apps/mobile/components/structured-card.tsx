import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import {
  Button,
  ChatMessageCard,
} from "@helpwave/hightide-native/components"
import { CalendarDays } from "lucide-react-native"
import { Text, View } from "react-native"
import type { StructuredCardMessage } from "@app-zum-doc/utils/api"

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

  return (
    <ChatMessageCard
      direction={message.direction}
      icon={<CalendarDays size={20} color={colors.icon} />}
      title={message.title}
      subtitle={message.subtitle}
      actions={
        message.actions && message.actions.length > 0 ? (
          <>
            {message.actions.map((action) => (
              <Button
                key={action.id}
                color={action.variant === "primary" ? "primary" : "neutral"}
                coloringStyle={action.variant === "primary" ? "solid" : "tonal"}
                disabled={isActionPending}
                onPress={() => onAction?.(action.id)}
                style={{ flex: 1 }}
              >
                {action.label}
              </Button>
            ))}
          </>
        ) : undefined
      }
    >
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
    </ChatMessageCard>
  )
}
