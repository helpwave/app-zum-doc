import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import type { Conversation } from "@app-zum-doc/utils/api"
import {
  AvatarWithStatus,
  ChatConversationRow,
} from "@helpwave/hightide-native/components"

type ConversationRowProps = {
  conversation: Conversation
  onPress?: () => void
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const unread = conversation.unreadCount > 0
  const contact = conversation.contact

  return (
    <ChatConversationRow
      onPress={onPress}
      avatar={
        <AvatarWithStatus
          name={contact.name}
          image={contactAvatarImage(contact.imageUri, contact.name)}
          ImageComponent={AzdAvatarImage}
          status={contact.presence ?? "unknown"}
          size={40}
        />
      }
      title={contact.name}
      timestamp={conversation.timeLabel}
      preview={conversation.lastMessage}
      unreadCount={conversation.unreadCount}
      sentIndicator={
        conversation.sentByMe && !unread ? "sentAndReceived" : undefined
      }
    />
  )
}
