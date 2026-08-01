import { PlaceholderScreen } from "@/components/placeholder-screen"
import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useRouter } from "expo-router"

export default function DoctorsPlaceholderScreen() {
  const t = useAppTranslation()
  const router = useRouter()

  return (
    <PlaceholderScreen
      title={t("myDoctors")}
      onBack={() => router.back()}
    />
  )
}
