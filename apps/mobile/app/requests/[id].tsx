import { PlaceholderScreen } from "@/components/placeholder-screen"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useLocalSearchParams, useRouter } from "expo-router"

export default function RequestDetailPlaceholderScreen() {
  const t = useAppTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const requestId = typeof id === "string" ? id : ""

  return (
    <PlaceholderScreen
      title={t("requestDetail")}
      description={
        requestId
          ? `${t("placeholderComingSoon")}\n\nID: ${requestId}`
          : t("placeholderComingSoon")
      }
      onBack={() => router.back()}
    />
  )
}
