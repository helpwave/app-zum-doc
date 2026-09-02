import { AddMedicationSheet } from "@/components/add-medication-sheet"
import { AppBar } from "@/components/app-bar"
import { QueryState } from "@/components/query-state"
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
  ListActionItem,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { Camera, CirclePlus, Pill, Trash, TriangleAlert } from "lucide-react-native"
import { useState } from "react"
import { Alert, ScrollView, View } from "react-native"

export default function MedicationsScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
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
        backgroundColor: colors.background,
      }}
    >
      <AppBar
        title={t("medicationList")}
        trailing={
          <IconButton
            icon={Camera}
            size="sm"
            variant="foreground"
            color={theme.colors.surfaceInverse}
            accessibilityLabel={t("scanMedication")}
            onPress={() => {
              Alert.alert(t("medicationList"), t("placeholderComingSoon"))
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
        style={{ backgroundColor: colors.background }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ListActionItem
            title={t("addMedication")}
            color={theme.colors.primary}
            leading={<ThemedIcon icon={CirclePlus} />}
            itemStyle={{
              borderRadius: theme.borderRadius.lg,
            }}
            titleStyle={(previous) => ({
              ...previous,
              color: theme.colors.primary.onColor,
              fontWeight: theme.fontWeights.medium,
            })}
            onPress={() => {
              setSheetVisible(true)
            }}
          />

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
            <Card key={medication.id}>
              <ListActionItem
                title={medication.name}
                subtitle={t("medicationSize", { size: medication.size })}
                leading={
                  <ThemedIcon
                    icon={Pill}
                    color={theme.colors.primary.color}
                  />
                }
                titleStyle={(previous) => ({
                  ...previous,
                  color: theme.colors.primary.color,
                })}
                trailing={
                  <IconButton
                    icon={Trash}
                    size="sm"
                    variant="foreground"
                    color={{color: theme.colors.surface.onColor, onColor: theme.colors.surface.color }}
                    accessibilityLabel={t("deleteMedication")}
                    onPress={() => {
                      void removeMedication.mutateAsync(medication.id)
                    }}
                  />
                }
              />
            </Card>
          ))}
        </ScrollView>
      </QueryState>

      <AddMedicationSheet
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
    </View>
  )
}
