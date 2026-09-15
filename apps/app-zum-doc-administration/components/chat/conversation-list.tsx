import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  ChatConversationList,
  ChatConversationRow,
  SearchBar
} from '@helpwave/hightide'
import {
  formatConversationPreviewTime,
  type AppLocale,
  type ConversationPreview
} from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

function conversationMatchesSearch(
  conversation: ConversationPreview,
  query: string
): boolean {
  if (query.length === 0) {
    return true
  }
  const haystack = [
    conversation.user.name,
    conversation.lastMessage.preview,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function ConversationList({
  conversations,
  locale,
}: {
  conversations: ConversationPreview[],
  locale: AppLocale,
}) {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return conversations.filter((conversation) =>
      conversationMatchesSearch(conversation, query)
    )
  }, [conversations, search])

  const emptyLabel = conversations.length === 0
    ? t('noChats')
    : t('noChatMatches')

  return (
    <ChatConversationList
      className="min-h-0 h-full"
      header={(
        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder={t('searchChats')}
          className="w-full"
        />
      )}
      headerClassName="px-4 pt-4 pb-2"
    >
      {filteredConversations.length === 0 ? (
        <p className="text-description px-4 py-2">{emptyLabel}</p>
      ) : (
        filteredConversations.map((conversation) => (
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
        ))
      )}
    </ChatConversationList>
  )
}
