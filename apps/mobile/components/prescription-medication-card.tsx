import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { MedicationSize } from "@app-zum-doc/utils/api"
import {
  Card,
  Divider,
  ListItem,
  ThemedIcon,
} from "@helpwave/hightide-native/components"
import { Pill } from "lucide-react-native"
import type { ReactNode } from "react"

type PrescriptionMedicationCardProps = {
  name: string
  size: MedicationSize
  trailing?: ReactNode
}

export function PrescriptionMedicationCard({
  name,
  size,
  trailing,
}: PrescriptionMedicationCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <Card>
      <ListItem
        title={name}
        subtitle={t("medicationLabel")}
        contentOrder="subtitleFirst"
        color={theme.colors.primary}
        trailing={<ThemedIcon icon={Pill} />}
      />
      <Divider />
      <ListItem
        title={t("medicationSize", { size })}
        subtitle={t("medicationPackageSize")}
        contentOrder="subtitleFirst"
        color={theme.colors.primary}
        trailing={trailing}
      />
    </Card>
  )
}
