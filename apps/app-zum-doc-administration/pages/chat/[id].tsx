import type { NextPage } from 'next'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  ChatAttachmentCard,
  ChatDateDivider,
  ChatMessageBubble,
  ChatMessageCard,
  ChatMessageComposer,
  ChatMessageList,
  ChatSystemLine,
  ChatThreadHeader
} from '@helpwave/hightide'
import {
  formatDateDivider,
  formatMessageTime,
  showsReadReceipt,
  toAppLocale
} from '@app-zum-doc/utils/api'
import {
  useMarkPracticeConversationRead,
  usePracticeConversation,
  usePracticeMessages,
  useSendPracticeMessage
} from '@app-zum-doc/utils/hooks'
import { ChatContainer } from '@/components/chat/chat-container'
import { Page, QueryState } from '@/components/layout/Page'
import { BackIconButton } from '@/components/layout/back-icon-button'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

const ChatThreadPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const conversationId = typeof router.query['id'] === 'string' ? router.query['id'] : ''
  const markedReadFor = useRef<string | null>(null)
  const conversationQuery = usePracticeConversation({
    parameters: conversationId ? { conversationId } : undefined,
  })
  const messagesQuery = usePracticeMessages({
    parameters: conversationId ? { conversationId } : undefined,
  })
  const markRead = useMarkPracticeConversationRead()
  const sendMessage = useSendPracticeMessage({ conversationId })

  useEffect(() => {
    if (!conversationId || markedReadFor.current === conversationId) {
      return
    }
    markedReadFor.current = conversationId
    markRead.mutate(conversationId)
  }, [conversationId, markRead])

  const user = conversationQuery.data?.user

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
          isPending={conversationQuery.isPending || messagesQuery.isPending || !conversationId}
          isError={conversationQuery.isError || messagesQuery.isError}
          error={conversationQuery.error ?? messagesQuery.error}
          onRetry={() => {
            void conversationQuery.refetch()
            void messagesQuery.refetch()
          }}
          loadingLabel={t('loadingMessages')}
        >
          <ChatMessageList className="flex-1 min-h-0">
            {(messagesQuery.data ?? []).map((message) => {
              if (message.type === 'date') {
                return (
                  <ChatDateDivider key={message.id}>
                    {formatDateDivider(message.date, locale)}
                  </ChatDateDivider>
                )
              }
              if (message.type === 'system') {
                return (
                  <ChatSystemLine key={message.id}>
                    {message.body}
                  </ChatSystemLine>
                )
              }
              if (message.type === 'card') {
                return (
                  <ChatMessageCard
                    key={message.id}
                    direction={message.direction}
                    title={message.title}
                    subtitle={message.subtitle}
                  >
                    <div className="flex-col-1">
                      <span>{message.primary}</span>
                      <span className="text-description">{message.detail}</span>
                    </div>
                  </ChatMessageCard>
                )
              }
              if (message.type === 'attachment') {
                return (
                  <ChatAttachmentCard
                    key={message.id}
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
            disabled={sendMessage.isPending || !conversationId}
            onSend={(value) => sendMessage.mutate(value)}
          />
        </QueryState>
      </ChatContainer>
    </Page>
  )
}

export default ChatThreadPage
