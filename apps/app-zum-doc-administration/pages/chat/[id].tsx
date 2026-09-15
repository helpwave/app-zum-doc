import type { NextPage } from 'next'
import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  ChatAttachmentCard,
  ChatDateDivider,
  ChatMessageBubble,
  ChatMessageComposer,
  ChatMessageList,
  ChatSystemLine,
  ChatThreadHeader
} from '@helpwave/hightide'
import {
  formatDateDivider,
  formatMessageTime,
  showsReadReceipt,
  toAppLocale,
  type Message
} from '@app-zum-doc/utils/api'
import {
  useMarkPracticeConversationRead,
  usePracticeConversation,
  usePracticeConversations,
  usePracticeMessages,
  useSendPracticeMessage
} from '@app-zum-doc/utils/hooks'
import { ChatContainer } from '@/components/chat/chat-container'
import { RequestChatMessages } from '@/components/chat/request-chat-messages'
import { Page, QueryState } from '@/components/layout/Page'
import { BackIconButton } from '@/components/layout/back-icon-button'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

function latestMessageIdForRequest(
  messages: Message[],
  requestId: string
): string | undefined {
  const matches = messages.filter((message) => (
    message.type === 'card' && message.requestId === requestId
  ))
  return matches.at(-1)?.id
}

function chatThreadId(asPath: string, queryId: unknown): string {
  const path = asPath.split('?')[0] ?? ''
  const segment = path.split('/').filter(Boolean)[1] ?? ''
  if (segment) {
    return segment
  }
  if (typeof queryId === 'string') {
    return queryId
  }
  return ''
}

const ChatThreadPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const routeId = chatThreadId(router.asPath, router.query['id'])
  const requestId = typeof router.query['requestId'] === 'string'
    ? router.query['requestId']
    : undefined
  const markedReadFor = useRef<string | null>(null)
  const conversationsQuery = usePracticeConversations({
    enabled: routeId.length > 0,
  })
  const conversationId = useMemo(() => {
    const conversations = conversationsQuery.data
    if (!conversations || routeId.length === 0) {
      return undefined
    }
    return conversations.find((conversation) => (
      conversation.user.id === routeId || conversation.id === routeId
    ))?.id
  }, [conversationsQuery.data, routeId])
  const conversationQuery = usePracticeConversation({
    parameters: conversationId ? { conversationId } : undefined,
    enabled: conversationId != null,
  })
  const messagesQuery = usePracticeMessages({
    parameters: conversationId ? { conversationId } : undefined,
    enabled: conversationId != null,
  })
  const markRead = useMarkPracticeConversationRead()
  const sendMessage = useSendPracticeMessage({ conversationId: conversationId ?? '' })

  useEffect(() => {
    if (!conversationId || markedReadFor.current === conversationId) {
      return
    }
    markedReadFor.current = conversationId
    markRead.mutate(conversationId)
  }, [conversationId, markRead])

  useEffect(() => {
    const messages = messagesQuery.data
    if (!messages) {
      return
    }
    const list = document.querySelector('.chat-container .chat-message-list')
    if (!(list instanceof HTMLElement)) {
      return
    }
    const targetId = requestId
      ? latestMessageIdForRequest(messages, requestId)
      : undefined
    const target = targetId
      ? list.querySelector(`[data-message-id="${targetId}"]`)
      : null
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ block: 'center' })
      return
    }
    list.scrollTop = list.scrollHeight
  }, [messagesQuery.data, requestId])

  const user = conversationQuery.data?.user
  const isPending = conversationsQuery.isPending
    || (conversationId != null && (conversationQuery.isPending || messagesQuery.isPending))
    || !routeId

  return (
    <Page pageTitle={titleWrapper(user?.name ?? t('chatsTitle'))} noScrolling>
      <ChatContainer>
        <ChatThreadHeader
          leftActions={(
            <BackIconButton onClick={() => void router.push('/chat')} />
          )}
          avatar={user ? { name: user.name, status: user.status } : undefined}
          title={user?.name ?? t('chatsTitle')}
          subtitle={t('patient')}
        />
        <QueryState
          isPending={isPending}
          isError={conversationsQuery.isError || conversationQuery.isError || messagesQuery.isError}
          error={conversationsQuery.error ?? conversationQuery.error ?? messagesQuery.error}
          onRetry={() => {
            void conversationsQuery.refetch()
            void conversationQuery.refetch()
            void messagesQuery.refetch()
          }}
          loadingLabel={t('loadingMessages')}
        >
          <ChatMessageList
            className="flex-1 min-h-0"
            autoScroll={requestId == null}
          >
            {(messagesQuery.data ?? []).map((message) => {
              if (message.type === 'date') {
                return (
                  <ChatDateDivider key={message.id} data-message-id={message.id}>
                    {formatDateDivider(message.date, locale)}
                  </ChatDateDivider>
                )
              }
              if (message.type === 'system') {
                return (
                  <ChatSystemLine key={message.id} data-message-id={message.id}>
                    {message.body}
                  </ChatSystemLine>
                )
              }
              if (message.type === 'card') {
                return (
                  <RequestChatMessages message={message} key={message.id} data-message-id={message.id} />
                )
              }
              if (message.type === 'attachment') {
                return (
                  <ChatAttachmentCard
                    key={message.id}
                    data-message-id={message.id}
                    direction={message.direction}
                    name={message.fileName}
                    metadata={`${message.fileType} · ${message.fileSize}`}
                    downloadLabel={t('downloadAttachment')}
                  />
                )
              }
              return (
                <ChatMessageBubble
                  key={message.id}
                  data-message-id={message.id}
                  direction={message.direction}
                  timestamp={formatMessageTime(message.time, locale)}
                  readReceipt={showsReadReceipt(message.status) ? t('statusConfirmed') : undefined}
                >
                  {message.body}
                </ChatMessageBubble>
              )
            })}
          </ChatMessageList>
          <ChatMessageComposer
            placeholder={t('messagePlaceholder')}
            sendLabel={t('sendMessage')}
            disabled={sendMessage.isPending || conversationId == null}
            onSend={(value) => sendMessage.mutate(value)}
          />
        </QueryState>
      </ChatContainer>
    </Page>
  )
}

export default ChatThreadPage
