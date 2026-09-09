import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import {
  ChatConversationList,
  ChatConversationRow
} from '@helpwave/hightide'
import {
  formatConversationPreviewTime,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { usePracticeConversations } from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

const ChatListPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const conversationsQuery = usePracticeConversations()

  return (
    <Page pageTitle={titleWrapper(t('chatsTitle'))} noScrolling>
      <QueryState
        isPending={conversationsQuery.isPending}
        isError={conversationsQuery.isError}
        error={conversationsQuery.error}
        onRetry={() => void conversationsQuery.refetch()}
        loadingLabel={t('loadingChats')}
      >
        {(conversationsQuery.data?.length ?? 0) === 0 ? (
          <p className="text-description">{t('noChats')}</p>
        ) : (
          <ChatConversationList>
            {conversationsQuery.data?.map((conversation) => (
              <ChatConversationRow
                key={conversation.id}
                avatar={{
                  name: conversation.user.name,
                  status: conversation.user.status,
                }}
                title={conversation.user.name}
                preview={conversation.lastMessage.preview}
                timestamp={formatConversationPreviewTime(
                  conversation.lastMessage.time,
                  locale
                )}
                unreadCount={conversation.unreadCount}
                onClick={() => void router.push(`/chat/${conversation.id}`)}
              />
            ))}
          </ChatConversationList>
        )}
      </QueryState>
    </Page>
  )
}

export default ChatListPage
