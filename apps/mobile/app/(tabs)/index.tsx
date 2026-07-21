import {
  useAppTranslation,
  useHomeSummary,
} from "app-zum-doc-utils/hooks"
import { useRouter } from "expo-router"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ConversationRow } from "@/components/conversation-row"
import {
  HomeHero,
  NextAppointmentCard,
  QuickActions,
} from "@/components/home-sections"
import { QueryState } from "@/components/query-state"
import { azd } from "@/theme/azd-tokens"

export default function HomeScreen() {
  const t = useAppTranslation()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const homeQuery = useHomeSummary()

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <QueryState
        isPending={homeQuery.isPending}
        isError={homeQuery.isError}
        error={homeQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
        }}
        loadingLabel={t("loadingHome")}
        style={styles.query}
      >
        {homeQuery.data ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <HomeHero summary={homeQuery.data} />
            {homeQuery.data.nextAppointment ? (
              <NextAppointmentCard appointment={homeQuery.data.nextAppointment} />
            ) : null}
            <Text style={styles.sectionTitle}>{t("quickAccess")}</Text>
            <QuickActions
              actions={homeQuery.data.quickActions}
              onPress={(href) => {
                router.push(href as "/(tabs)/chat")
              }}
            />
            {homeQuery.data.recentConversation ? (
              <>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>{t("recentMessages")}</Text>
                  {homeQuery.data.unreadChatCount > 0 ? (
                    <Text style={styles.unreadHint}>
                      {t("unreadCount", { count: homeQuery.data.unreadChatCount })}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.recentCard}>
                  <ConversationRow
                    conversation={homeQuery.data.recentConversation}
                    onPress={() => {
                      router.push({
                        pathname: "/chat/[id]",
                        params: {
                          id: homeQuery.data!.recentConversation!.id,
                        },
                      })
                    }}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: azd.bg.app,
  },
  query: {
    backgroundColor: azd.bg.app,
  },
  content: {
    paddingHorizontal: azd.space[4],
    paddingTop: azd.space[5],
    paddingBottom: azd.space[8],
  },
  sectionTitle: {
    fontFamily: azd.font.tabular,
    fontWeight: "700",
    fontSize: 12,
    color: azd.fg[6],
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: azd.space[2],
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: azd.space[2],
  },
  unreadHint: {
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 13,
    color: azd.green[600],
  },
  recentCard: {
    borderRadius: azd.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: azd.border,
    backgroundColor: azd.bg.surface,
  },
})
