import { ChatMessageBubble } from "@helpwave/hightide-native/components"
import {
  formatMessageTime,
  showsReadReceipt,
  toAppLocale,
  type TextMessage,
} from "@app-zum-doc/utils/api"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"

type MessageBubbleProps = {
  message: TextMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)

  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={formatMessageTime(message.time, locale)}
      readReceipt={
        message.direction === "outgoing" && showsReadReceipt(message.status)
          ? "Gelesen"
          : undefined
      }
    >
      {message.body}
    </ChatMessageBubble>
  )
}
