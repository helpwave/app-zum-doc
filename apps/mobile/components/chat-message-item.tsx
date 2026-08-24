import {
  ChatDateDivider,
  ChatSystemLine,
} from "@helpwave/hightide-native/components"
import { AttachmentCard } from "@/components/attachment-card"
import { MessageBubble } from "@/components/message-bubble"
import { StructuredCard } from "@/components/structured-card"
import type { ChatMessage } from "@app-zum-doc/utils/api"

type ChatMessageItemProps = {
  message: ChatMessage
  onCardAction?: (messageId: string, actionId: string) => void
  isCardActionPending?: boolean
}

export function ChatMessageItem({
  message,
  onCardAction,
  isCardActionPending = false,
}: ChatMessageItemProps) {
  switch (message.type) {
  case "date":
    return <ChatDateDivider>{message.label}</ChatDateDivider>
  case "system":
    return <ChatSystemLine>{message.body}</ChatSystemLine>
  case "text":
    return <MessageBubble message={message} />
  case "card":
    return (
      <StructuredCard
        message={message}
        isActionPending={isCardActionPending}
        onAction={(actionId) => onCardAction?.(message.id, actionId)}
      />
    )
  case "attachment":
    return <AttachmentCard message={message} />
  default:
    return null
  }
}
