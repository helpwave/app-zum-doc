import { PlaceholderScreen } from "@/components/placeholder-screen"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useRouter } from "expo-router"

export default function PersonalInformationScreen() {
  const t = useAppTranslation()
  const router = useRouter()

  return (
    <PlaceholderScreen
      title={t("personalData")}
      onBack={() => router.back()}
    />
  )
}
