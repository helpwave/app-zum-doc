import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { ConversationRow } from "@/components/conversation-row"
import { QueryState } from "@/components/query-state"
import { ScreenHeader } from "@/components/screen-header"
import { SearchField } from "@/components/search-field"
import { useConversations } from "@app-zum-doc/utils/hooks"
import {
  ChatConversationList,
  IconButton,
} from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { MessageCircle } from "lucide-react-native"
import { useState } from "react"
import { View } from "react-native"
import { useAppTranslation } from "../hooks/useAppTranslation"

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
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={t("searchPracticeOrMessage")}
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
