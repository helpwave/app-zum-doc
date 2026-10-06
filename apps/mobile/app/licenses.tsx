import { AppBar } from "@/components/app-bar"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { licenseDocument } from "@/generated/licenses"
import { ListNavigationItem, ThemedText } from "@helpwave/hightide-native/components"
import { useRouter, type Href } from "expo-router"
import { View } from "react-native"

export default function LicensesScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("licenses")} />
      <VirtualList
        data={licenseDocument.packages}
        keyExtractor={(item) => `${item.name}@${item.version}`}
        contentContainerStyle={{
          paddingBottom: theme.spacing.lg,
        }}
        ListHeaderComponent={
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.md,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.md,
            }}
          >
            {t("licensesDescription")}
          </ThemedText>
        }
        renderItem={({ item }) => {
          const licenseLabel = item.licenseIds
            .map((licenseId) => licenseDocument.licenses[licenseId]?.name ?? licenseId)
            .join(", ")
          return (
            <ListNavigationItem
              title={item.name}
              subtitle={`${item.version} · ${licenseLabel}`}
              style={{
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.background.color,
              }}
              onPress={() => {
                const name = encodeURIComponent(item.name)
                const version = encodeURIComponent(item.version)
                router.push(`/license-detail?name=${name}&version=${version}` as Href)
              }}
            />
          )
        }}
      />
    </View>
  )
}
