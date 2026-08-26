import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  formatConversationPreviewTime,
  showsSentIndicator,
  toAppLocale,
  type ConversationPreview,
} from "@app-zum-doc/utils/api"
import {
  AvatarWithStatus,
  ChatConversationRow,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type ConversationRowProps = {
  conversation: ConversationPreview
  onPress?: () => void
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const user = conversation.user
  const lastMessage = conversation.lastMessage
  const { theme } = useAzdTheme()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const safeAreaInsets = useSafeAreaInsets()

  return (
    <ChatConversationRow
      onPress={onPress}
      avatarProps={{
        name: user.name,
        image: contactAvatarImage(user.imageUri, user.name),
      }}
      title={user.name}
      timestamp={formatConversationPreviewTime(lastMessage.time, locale)}
      preview={lastMessage.preview}
      unreadCount={conversation.unreadCount}
      messageStatus={lastMessage.status}
      style={{
        ...StyleAdapterUtils.padding({
          type: "physicalSide",
          left: safeAreaInsets.left + theme.padding.xl,
          right: safeAreaInsets.right + theme.padding.xl,
        })
      }}
    />
  )
}
