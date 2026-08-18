import { ConversationRow } from "@/components/conversation-row"
import { QueryState } from "@/components/query-state"
import { ScreenHeader } from "@/components/screen-header"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useConversations } from "@app-zum-doc/utils/hooks"
import {
  ChatConversationList,
  IconButton,
  SearchBar,
} from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { MessageCircle } from "lucide-react-native"
import { useState } from "react"
import { View } from "react-native"
import { useAppTranslation } from "../../hooks/useAppTranslation"

export default function ChatListScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const [search, setSearch] = useState("")
  const conversationsQuery = useConversations(search)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScreenHeader
        title={t("chatsTitle")}
        trailing={
          <IconButton
            accessibilityLabel={t("newMessage")}
            icon={MessageCircle}
            size="md"
            variant="foreground"
          />
        }
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
          {(conversationsQuery.data ?? []).map((item) => (
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
