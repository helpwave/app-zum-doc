import {
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  formatConversationPreviewTime,
  toAppLocale,
  type ConversationPreview,
} from "@app-zum-doc/utils/api"
import { ChatConversationRow, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { View } from "react-native"

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

export function ConversationPlaceholderRow() {
  const { theme } = useAzdTheme()
  const safeAreaInsets = useSafeAreaInsets()
  const avatarSize = theme.semantics.container.md.size

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        ...StyleAdapterUtils.padding({
          type: "physicalSide",
          left: safeAreaInsets.left + theme.padding.xl,
          right: safeAreaInsets.right + theme.padding.xl,
        }),
        paddingTop: theme.padding.lg,
        paddingBottom: theme.padding.lg,
      }}
    >
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: 9999,
          backgroundColor: theme.colors.disabled.color,
        }}
      />
      <View style={{ flex: 1, gap: theme.spacing.sm }}>
        <View
          style={{
            width: "46%",
            height: theme.typography.body.md.fontSize ?? 16,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.disabled.color,
          }}
        />
        <View
          style={{
            width: "72%",
            height: theme.typography.body.sm.fontSize ?? 14,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.disabled.color,
          }}
        />
      </View>
    </View>
  )
}

export function ConversationEmptyCard() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const safeAreaInsets = useSafeAreaInsets()

  return (
    <View
      style={{
        minHeight: theme.semantics.container.md.size + theme.padding.lg * 2,
        alignItems: "center",
        justifyContent: "center",
        ...StyleAdapterUtils.padding({
          type: "physicalSide",
          left: safeAreaInsets.left + theme.padding.xl,
          right: safeAreaInsets.right + theme.padding.xl,
        }),
        paddingTop: theme.padding.lg,
        paddingBottom: theme.padding.lg,
      }}
    >
      <ThemedText
        appearance="description"
        style={{
          ...theme.typography.body.md,
          textAlign: "center",
        }}
      >
        {t("noChatsYet")}
      </ThemedText>
    </View>
  )
}
