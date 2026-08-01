import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { ChatMessageItem } from "@/components/chat-message-item"
import { Composer } from "@/components/composer"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "../hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  AvatarWithStatus,
  ChatMessageList,
  ChatThreadHeader,
  IconButton,
} from "@helpwave/hightide-native/components"
import {
  useConversation,
  useMarkConversationRead,
  useMessages,
  useResolveCardAction,
  useSendMessage,
} from "@app-zum-doc/utils/hooks"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, Phone } from "lucide-react-native"
import { useEffect, useRef } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function ChatThreadScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
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

  return (
    <KeyboardAvoidingView 
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.headerShell,
          {
            paddingTop: insets.top,
            backgroundColor: headerColors.background,
          },
        ]}
      >
        <ChatThreadHeader
          leftActions={
            <IconButton
              accessibilityLabel={t("back")}
              icon={ChevronLeft}
              size="md"
              color="primary"
              coloringStyle="text"
              onPress={() => router.back()}
            />
          }
          avatar={
            contact ? (
              <AvatarWithStatus
                name={contact.name}
                image={contactAvatarImage(contact.imageUri, contact.name)}
                ImageComponent={AzdAvatarImage}
                status={contact.presence ?? "unknown"}
                size="sm"
              />
            ) : undefined
          }
          title={contact?.name ?? t("tabChats")}
          subtitle={contact ? (contact.subtitle ?? t("practice")) : undefined}
          rightActions={
            <IconButton
              accessibilityLabel={t("call")}
              icon={Phone}
              size="md"
              color="primary"
              coloringStyle="text"
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
        <ChatMessageList>
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
        />
      </QueryState>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerShell: {},
})
