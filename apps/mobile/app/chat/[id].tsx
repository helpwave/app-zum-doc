import { ChevronLeft, Phone } from "lucide-react-native"
import { useAppTranslation } from "app-zum-doc-utils/hooks"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Avatar } from "@/components/avatar"
import { ChatMessageItem } from "@/components/chat-message-item"
import { Composer } from "@/components/composer"
import { QueryState } from "@/components/query-state"
import {
  useConversation,
  useMarkConversationRead,
  useMessages,
  useResolveCardAction,
  useSendMessage,
} from "@/hooks/use-conversations"
import { azd } from "@/theme/azd-tokens"

export default function ChatThreadScreen() {
  const t = useAppTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversationId = typeof id === "string" ? id : ""
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const markedReadFor = useRef<string | null>(null)

  const conversationQuery = useConversation(conversationId)
  const messagesQuery = useMessages(conversationId)
  const markRead = useMarkConversationRead()
  const sendMessage = useSendMessage(conversationId)
  const resolveCard = useResolveCardAction(conversationId)

  useEffect(() => {
    if (!conversationId || markedReadFor.current === conversationId) {
      return
    }
    markedReadFor.current = conversationId
    markRead.mutate(conversationId)
  }, [conversationId, markRead])

  const isPending = conversationQuery.isPending || messagesQuery.isPending
  const isError = conversationQuery.isError || messagesQuery.isError
  const error = conversationQuery.error ?? messagesQuery.error

  const refetch = () => {
    void conversationQuery.refetch()
    void messagesQuery.refetch()
  }

  const contact = conversationQuery.data?.contact

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("back")}
        >
          <ChevronLeft size={22} color={azd.green[600]} />
        </Pressable>
        {contact ? (
          <>
            <Avatar
              id={contact.id}
              name={contact.name}
              initials={contact.initials}
              imageUri={contact.imageUri}
              presence={contact.presence}
              size={40}
            />
            <View style={styles.appBarText}>
              <Text style={styles.appBarTitle} numberOfLines={1}>
                {contact.name}
              </Text>
              <Text style={styles.appBarSubtitle} numberOfLines={1}>
                {contact.subtitle ?? t("practice")}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.appBarText}>
            <Text style={styles.appBarTitle}>{t("tabChats")}</Text>
          </View>
        )}
        <Pressable
          style={styles.callButton}
          accessibilityRole="button"
          accessibilityLabel={t("call")}
        >
          <Phone size={18} color={azd.green[600]} />
        </Pressable>
      </View>

      <QueryState
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingLabel={t("loadingMessages")}
      >
        <FlatList
          data={messagesQuery.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <ChatMessageItem
              message={item}
              isCardActionPending={resolveCard.isPending}
              onCardAction={(messageId, actionId) => {
                resolveCard.mutate({ messageId, actionId })
              }}
            />
          )}
        />
        <Composer
          placeholder={t("messagePlaceholder")}
          onSend={(text) => {
            sendMessage.mutate(text)
          }}
          isSending={sendMessage.isPending}
          errorMessage={
            sendMessage.isError
              ? (sendMessage.error?.message ?? t("errorUnknown"))
              : null
          }
        />
      </QueryState>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: azd.bg.app,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: azd.bg.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
  },
  appBarText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  appBarTitle: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 16,
    color: azd.fg[1],
  },
  appBarSubtitle: {
    fontSize: 12,
    fontWeight: "300",
    color: azd.fg[5],
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
})
