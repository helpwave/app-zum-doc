import { AttachmentCard } from "@/components/attachment-card"
import { MessageBubble } from "@/components/message-bubble"
import { DateDivider, SystemLine } from "@/components/system-line"
import { StructuredCard } from "@/components/structured-card"
import type { ChatMessage } from "@/api/mock/types"

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
      return <DateDivider label={message.label} />
    case "system":
      return <SystemLine body={message.body} />
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
