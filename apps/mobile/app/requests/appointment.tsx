import { PlaceholderScreen } from "@/components/placeholder-screen"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useRouter } from "expo-router"

export default function AppointmentPlaceholderScreen() {
  const t = useAppTranslation()
  const router = useRouter()

  return (
    <PlaceholderScreen
      title={t("actionAppointment")}
      onBack={() => router.back()}
    />
  )
}
