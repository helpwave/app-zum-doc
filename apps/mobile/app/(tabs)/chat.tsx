import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { ConversationPreview } from "@app-zum-doc/utils/api"
import { useConversations } from "@app-zum-doc/utils/hooks"
import {
  SearchBar,
} from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ScrollView, View } from "react-native"
import { ConversationEmptyCard, ConversationPlaceholderRow, ConversationRow } from "@/components/conversation-row"
import { AppBar } from "@/components/app-bar"
import { useSafeAreaInsets } from "react-native-safe-area-context"

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
  const insets = useSafeAreaInsets()
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
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar
        title={t("chatsTitle")}
      >
        <View 
          style={{
            paddingLeft: insets.left + theme.padding.lg,
            paddingRight: insets.right + theme.padding.lg,
            paddingBottom: theme.padding.lg,
          }}
        >
          <SearchBar
            value={search}
            placeholder={t("searchPracticeOrMessage")}
            onValueChange={(value) => {
              setSearch(value ?? "")
            }}
            onSearch={setSearch}
          />
        </View>
      </AppBar>

      <QueryState
        isPending={false}
        isError={conversationsQuery.isError}
        error={conversationsQuery.error}
        onRetry={() => {
          void conversationsQuery.refetch()
        }}
        loadingLabel={t("loadingChats")}
      >
        <ScrollView keyboardShouldPersistTaps="always">
          {conversationsQuery.isPending ? (
            <ConversationPlaceholderRow />
          ) : (conversationsQuery.data ?? []).length === 0 ? (
            <ConversationEmptyCard />
          ) : conversations.map((item) => (
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
        </ScrollView>
      </QueryState>
    </View>
  )
}
