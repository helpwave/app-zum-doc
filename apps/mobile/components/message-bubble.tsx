import { ChatMessageBubble } from "@helpwave/hightide-native/components"
import type { TextMessage } from "@app-zum-doc/utils/api"

type MessageBubbleProps = {
  message: TextMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={message.timeLabel}
      readReceipt={
        message.direction === "outgoing" && message.receipt === "read"
          ? "Gelesen"
          : undefined
      }
    >
      {message.body}
    </ChatMessageBubble>
  )
}
