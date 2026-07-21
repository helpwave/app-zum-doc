import { MessageCircle } from "lucide-react-native"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Avatar } from "@/components/avatar"
import { azd } from "@/theme/azd-tokens"
import type { Conversation } from "app-zum-doc-utils/api/types"

type ConversationRowProps = {
  conversation: Conversation
  onPress?: () => void
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const unread = conversation.unreadCount > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar
        id={conversation.contact.id}
        name={conversation.contact.name}
        initials={conversation.contact.initials}
        imageUri={conversation.contact.imageUri}
        presence={conversation.contact.presence}
        size={52}
      />
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text
            style={[styles.name, unread ? styles.nameUnread : styles.nameRead]}
            numberOfLines={1}
          >
            {conversation.contact.name}
          </Text>
          <Text style={[styles.time, unread ? styles.timeUnread : styles.timeRead]}>
            {conversation.timeLabel}
          </Text>
        </View>
        <View style={styles.bottomLine}>
          <View style={styles.previewRow}>
            {conversation.sentByMe && !unread ? (
              <MessageCircle size={14} color={azd.green[600]} />
            ) : null}
            <Text
              style={[styles.preview, unread ? styles.previewUnread : styles.previewRead]}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
          </View>
          {unread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: azd.space[3],
    paddingHorizontal: azd.space[4],
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
    backgroundColor: azd.bg.surface,
  },
  pressed: {
    backgroundColor: azd.bg.app,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 5,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: azd.space[2],
  },
  name: {
    flex: 1,
    fontFamily: azd.font.display,
    fontSize: 16,
    color: azd.fg[1],
  },
  nameUnread: {
    fontWeight: "700",
  },
  nameRead: {
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    flexShrink: 0,
  },
  timeUnread: {
    fontWeight: "500",
    color: azd.green[600],
  },
  timeRead: {
    color: azd.fg[6],
  },
  bottomLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: azd.space[2],
  },
  previewRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  preview: {
    flex: 1,
    fontFamily: azd.font.display,
    fontSize: 14,
    fontWeight: "300",
  },
  previewUnread: {
    color: azd.fg[4],
  },
  previewRead: {
    color: azd.fg[5],
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.green[600],
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: azd.font.tabular,
    fontWeight: "700",
    fontSize: 11,
    color: "#FFFFFF",
  },
})
