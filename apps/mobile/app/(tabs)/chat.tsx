import { MessageCircle } from "lucide-react-native"
import { useAppTranslation } from "app-zum-doc-utils/hooks"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ConversationRow } from "@/components/conversation-row"
import { QueryState } from "@/components/query-state"
import { ScreenHeader } from "@/components/screen-header"
import { SearchField } from "@/components/search-field"
import { useConversations } from "@/hooks/use-conversations"
import { azd } from "@/theme/azd-tokens"

export default function ChatListScreen() {
  const t = useAppTranslation()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const conversationsQuery = useConversations(search)

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t("chatsTitle")}
        trailing={
          <Pressable
            style={styles.composeButton}
            accessibilityRole="button"
            accessibilityLabel={t("newMessage")}
          >
            <MessageCircle size={19} color={azd.green[600]} />
          </Pressable>
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
        <FlatList
          data={conversationsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() => {
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: item.id },
                })
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      </QueryState>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: azd.bg.app,
  },
  composeButton: {
    width: 38,
    height: 38,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
    backgroundColor: azd.bg.surface,
  },
  listContent: {
    flexGrow: 1,
  },
})
