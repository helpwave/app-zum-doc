import { useAppTranslation } from "@/hooks/useAppTranslation"
import type { MedicationSize } from "@app-zum-doc/utils/api"
import {
  Card,
  ListItem,
  ThemedIcon,
} from "@helpwave/hightide-native/components"
import { Pill } from "lucide-react-native"

type PrescriptionMedicationCardProps = {
  name: string
  size: MedicationSize
}

export function PrescriptionMedicationCard({
  name,
  size,
}: PrescriptionMedicationCardProps) {
  const t = useAppTranslation()

  return (
    <Card>
      <ListItem
        title={name}
        subtitle={t("medicationSize", { size })}
        contentOrder="titleFirst"
        leading={<ThemedIcon icon={Pill} />}
      />
    </Card>
  )
}
