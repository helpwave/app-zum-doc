import { ChatMessageBubble } from "@helpwave/hightide-native/components"
import {
  type TextMessage,
} from "@app-zum-doc/utils/api"

type MessageBubbleProps = {
  message: TextMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {

  return (
    <ChatMessageBubble
      direction={message.direction}
      timestamp={message.time}
      status={message.status}
    >
      {message.body}
    </ChatMessageBubble>
  )
}
