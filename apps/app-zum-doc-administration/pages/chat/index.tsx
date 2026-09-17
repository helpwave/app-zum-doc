import type { NextPage } from 'next'
import { toAppLocale } from '@app-zum-doc/utils/api'
import { usePracticeConversations } from '@app-zum-doc/utils/hooks'
import { ChatContainer } from '@/components/chat/chat-container'
import { ConversationList } from '@/components/chat/conversation-list'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import titleWrapper from '@/utils/titleWrapper'

const ChatListPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const conversationsQuery = usePracticeConversations()

  return (
    <Page pageTitle={titleWrapper(t('chatsTitle'))} noScrolling>
      <ChatContainer>
        <QueryState
          isPending={conversationsQuery.isPending}
          isError={conversationsQuery.isError}
          error={conversationsQuery.error}
          onRetry={() => void conversationsQuery.refetch()}
          loadingLabel={t('loadingChats')}
        >
          <ConversationList
            conversations={conversationsQuery.data ?? []}
            locale={locale}
          />
        </QueryState>
      </ChatContainer>
    </Page>
  )
}

export default ChatListPage
