import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { ChatMessageItem } from "@/components/chat-message-item"
import { Composer } from "@/components/composer"
import { QueryState } from "@/components/query-state"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useKeyBoard } from "@/hooks/useKeyBoardIsVisible"
import {
  useConversation,
  useMarkConversationRead,
  useMessages,
  useResolveCardAction,
  useSendMessage,
} from "@app-zum-doc/utils/hooks"
import {
  ChatMessageList,
  ChatThreadHeader,
  IconButton
} from "@helpwave/hightide-native/components"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, Phone } from "lucide-react-native"
import { useEffect, useRef } from "react"
import { KeyboardAvoidingView, Platform, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTranslation } from "../../hooks/useAppTranslation"

export default function ChatThreadScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const headerColors = theme.components.screenHeader
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
  const { isVisible: isKeyboardVisible } = useKeyBoard()

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
    >
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: headerColors.background,
        }}
      >
        <ChatThreadHeader
          leftActions={
            <IconButton
              accessibilityLabel={t("back")}
              icon={ChevronLeft}
              size="md"
              variant="foreground"
              onPress={() => router.back()}
            />
          }
          avatar={
            contact ? ({
              name: contact.name,
              image: contactAvatarImage(contact.imageUri, contact.name),
              ImageComponent: AzdAvatarImage,
            }) : undefined
          }
          title={contact?.name ?? t("tabChats")}
          subtitle={contact ? (contact.subtitle ?? t("practice")) : undefined}
          rightActions={
            <IconButton
              accessibilityLabel={t("call")}
              icon={Phone}
              size="md"
              variant="foreground"
            />
          }
        />
      </View>

      <QueryState
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingLabel={t("loadingMessages")}
      >
        <ChatMessageList style={{ flex: 1 }}>
          {(messagesQuery.data ?? []).map((item) => (
            <ChatMessageItem
              key={item.id}
              message={item}
              isCardActionPending={resolveCard.isPending}
              onCardAction={(messageId, actionId) => {
                resolveCard.mutate({ messageId, actionId })
              }}
            />
          ))}
        </ChatMessageList>
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
          style={{paddingBottom: isKeyboardVisible ? theme.padding.xl : insets.bottom + theme.padding.md }}
        />
      </QueryState>
    </KeyboardAvoidingView>
  )
}
