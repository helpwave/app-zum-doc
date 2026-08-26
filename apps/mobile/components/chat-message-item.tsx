import {
  ChatDateDivider,
  ChatSystemLine,
} from "@helpwave/hightide-native/components"
import { AttachmentCard } from "@/components/attachment-card"
import { MessageBubble } from "@/components/message-bubble"
import { StructuredCard } from "@/components/structured-card"
import {
  formatDateDivider,
  toAppLocale,
  type Message,
} from "@app-zum-doc/utils/api"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"

type ChatMessageItemProps = {
  message: Message
  onCardAction?: (messageId: string, actionId: string) => void
  isCardActionPending?: boolean
}

export function ChatMessageItem({
  message,
  onCardAction,
  isCardActionPending = false,
}: ChatMessageItemProps) {
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)

  switch (message.type) {
  case "date":
    return (
      <ChatDateDivider>{formatDateDivider(message.date, locale)}</ChatDateDivider>
    )
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
