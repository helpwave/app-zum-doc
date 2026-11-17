import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { setScannedMedication, useScannedMedication } from "@/state/scanned-medication"
import {
  MedicationSizeUtils,
  type MedicationSize,
} from "@app-zum-doc/utils/api"
import { useAddPatientMedication } from "@app-zum-doc/utils/hooks"
import {
  Button,
  ListActionItem,
  Modal,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useRouter, type Href } from "expo-router"
import { Check } from "lucide-react-native"
import { useState } from "react"
import { View } from "react-native"

export function ScannedMedicationPopup() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const result = useScannedMedication()
  const item = result?.item ?? null
  const addMedication = useAddPatientMedication()
  const [selectedSize, setSelectedSize] = useState<MedicationSize | undefined>()
  const [sizedItemId, setSizedItemId] = useState<string | null>(null)

  if ((item?.id ?? null) !== sizedItemId) {
    setSizedItemId(item?.id ?? null)
    setSelectedSize(undefined)
  }

  const close = () => {
    if (addMedication.isPending) {
      return
    }
    setScannedMedication(null)
  }

  const add = () => {
    if (item == null || selectedSize == null || addMedication.isPending) {
      return
    }
    void addMedication.mutateAsync({
      catalogId: item.id,
      name: item.name,
      size: selectedSize,
    }).then(() => {
      setScannedMedication(null)
    })
  }

  return (
    <Modal
      isOpen={result != null}
      onIsOpenChange={(isOpen) => {
        if (!isOpen) {
          close()
        }
      }}
      showCloseButton={false}
    >
      <View style={{ gap: theme.spacing.lg, padding: theme.padding.xl }}>
        <View style={{ gap: theme.spacing.sm }}>
          {item == null ? (
            <ThemedText
              appearance="description"
              style={theme.typography.body.md}
            >
              {t("noSearchResults")}
            </ThemedText>
          ) : (
            <ThemedText
              style={{
                ...theme.typography.heading.lg,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              {item.name}
            </ThemedText>
          )}
          {item?.ingredient ? (
            <ThemedText
              appearance="description"
              style={theme.typography.body.md}
            >
              {item.ingredient}
            </ThemedText>
          ) : null}
        </View>
        {item == null ? null : (
          <View>
            {MedicationSizeUtils.array.map((size) => {
              const isSelected = size === selectedSize
              return (
                <ListActionItem
                  key={size}
                  title={t("medicationSize", { size })}
                  color={isSelected ? theme.colors.primary : undefined}
                  trailing={isSelected ? <ThemedIcon icon={Check} /> : undefined}
                  onPress={() => {
                    setSelectedSize(size)
                  }}
                />
              )
            })}
          </View>
        )}
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            variant="tonal"
            disabled={addMedication.isPending}
            onPress={close}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="tonal"
            disabled={addMedication.isPending}
            onPress={() => {
              setScannedMedication(null)
              router.push("/scan-medication" as Href)
            }}
          >
            {t("scanAgain")}
          </Button>
          {item == null ? null : (
            <Button
              disabled={selectedSize == null || addMedication.isPending}
              isProcessing={addMedication.isPending}
              onPress={add}
            >
              {t("add")}
            </Button>
          )}
        </View>
      </View>
    </Modal>
  )
}
