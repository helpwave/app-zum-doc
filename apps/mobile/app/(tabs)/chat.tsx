import { QueryState } from "@/components/query-state"
import { ScreenHeader } from "@/components/screen-header"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { ConversationPreview } from "@app-zum-doc/utils/api"
import { useConversations } from "@app-zum-doc/utils/hooks"
import {
  ChatConversationList,
  SearchBar,
} from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { View } from "react-native"
import { ConversationRow } from "@/components/conversation-row"

function conversationMatchesSearch(conversation: ConversationPreview, query: string) {
  if (query.length === 0) {
    return true
  }

  const haystack = [
    conversation.user.name,
    conversation.lastMessage.preview,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

export default function ChatListScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const [search, setSearch] = useState("")
  const conversationsQuery = useConversations()
  const conversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (conversationsQuery.data ?? []).filter((conversation) =>
      conversationMatchesSearch(conversation, query),
    )
  }, [conversationsQuery.data, search])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScreenHeader
        title={t("chatsTitle")}
      >
        <SearchBar
          value={search}
          placeholder={t("searchPracticeOrMessage")}
          onValueChange={(value) => {
            setSearch(value ?? "")
          }}
          onSearch={setSearch}
        />
      </ScreenHeader>

      <QueryState
        isPending={conversationsQuery.isPending}
        isError={conversationsQuery.isError}
        error={conversationsQuery.error}
        onRetry={() => {
          void conversationsQuery.refetch()
        }}
        loadingLabel={t("loadingChats")}
      >
        <ChatConversationList>
          {conversations.map((item) => (
            <ConversationRow
              key={item.id}
              conversation={item}
              onPress={() => {
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: item.id },
                })
              }}
            />
          ))}
        </ChatConversationList>
      </QueryState>
    </View>
  )
}
