import { AddMedicationSheet } from "@/components/add-medication-sheet"
import { AppBar } from "@/components/app-bar"
import { MedicationCard } from "@/components/medication-card"
import { QueryState } from "@/components/query-state"
import { ScannedMedicationPopup } from "@/components/scanned-medication-popup"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  useAddPatientMedication,
  usePatientMedications,
  useRemovePatientMedication,
} from "@app-zum-doc/utils/hooks"
import {
  Button,
  Card,
  IconButton,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { CirclePlus, Trash, TriangleAlert } from "lucide-react-native"
import { useState } from "react"
import { ScrollView, View } from "react-native"

export default function MedicationsScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const medicationsQuery = usePatientMedications()
  const addMedication = useAddPatientMedication()
  const removeMedication = useRemovePatientMedication()

  const [hintDismissed, setHintDismissed] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)

  const medications = medicationsQuery.data ?? []
  const showHint = medications.length === 0 && !hintDismissed

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar
        title={t("medicationList")}
        trailing={
          <IconButton
            icon={CirclePlus}
            size="sm"
            variant="foreground"
            color={theme.colors.surfaceInverse}
            accessibilityLabel={t("addMedication")}
            onPress={() => {
              setSheetVisible(true)
            }}
          />
        }
      />
      <QueryState
        isPending={medicationsQuery.isPending}
        isError={medicationsQuery.isError}
        error={medicationsQuery.error}
        onRetry={() => {
          void medicationsQuery.refetch()
        }}
        loadingLabel={t("loadingMedications")}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {showHint ? (
            <Card
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.md,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.sm,
                }}
              >
                <ThemedIcon
                  icon={TriangleAlert}
                  color={theme.colors.primary.color}
                />
                <ThemedText
                  style={{
                    ...theme.typography.body.md,
                    fontWeight: theme.fontWeights.bold,
                    color: theme.colors.primary.color,
                  }}
                >
                  {t("goodToKnow")}
                </ThemedText>
              </View>
              <ThemedText style={theme.typography.body.md}>
                {t("medicationListHint")}
              </ThemedText>
              <View style={{ alignItems: "flex-end" }}>
                <Button
                  size="sm"
                  variant="foreground"
                  onPress={() => {
                    setHintDismissed(true)
                  }}
                >
                  {t("understood")}
                </Button>
              </View>
            </Card>
          ) : null}

          {medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              name={medication.name}
              size={medication.size}
              ingredient={medication.ingredient}
              trailing={
                <IconButton
                  icon={Trash}
                  size="sm"
                  variant="foreground"
                  color={{color: theme.colors.surface.onColor, onColor: theme.colors.surface.color }}
                  accessibilityLabel={t("deleteMedication")}
                  isProcessing={
                    removeMedication.isPending
                    && removeMedication.variables === medication.id
                  }
                  disabled={
                    removeMedication.isPending
                    && removeMedication.variables !== medication.id
                  }
                  onPress={() => {
                    void removeMedication.mutateAsync(medication.id)
                  }}
                />
              }
            />
          ))}
        </ScrollView>
      </QueryState>

      <AddMedicationSheet
        key={sheetVisible ? "open" : "closed"}
        visible={sheetVisible}
        isSubmitting={addMedication.isPending}
        onSubmit={(selection) => {
          void addMedication.mutateAsync(selection).then(() => {
            setSheetVisible(false)
          })
        }}
        onClose={() => {
          setSheetVisible(false)
        }}
      />
      <ScannedMedicationPopup />
    </View>
  )
}
