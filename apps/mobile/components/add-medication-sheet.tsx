import { Stepper } from "@/components/stepper"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  MedicationSizeUtils,
  type MedicationCatalogItem,
  type MedicationSize,
} from "@app-zum-doc/utils/api"
import { useMedicationSearch } from "@app-zum-doc/utils/hooks"
import { HexColorUtils } from "@helpwave/hightide-design/utils"
import {
  ListActionItem,
  SearchBar,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useDebouncer } from "@helpwave/hightide-utils/hooks"
import { Check, Pill } from "lucide-react-native"
import { useEffect, useState } from "react"
import { ActivityIndicator, Modal, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type AddMedicationSheetProps = {
  visible: boolean
  isSubmitting?: boolean
  onSubmit: (selection: {
    catalogId: string
    name: string
    size: MedicationSize
  }) => void
  onClose: () => void
}

const stepCount = 2

export function AddMedicationSheet({
  visible,
  isSubmitting = false,
  onSubmit,
  onClose,
}: AddMedicationSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const debounceSearch = useDebouncer()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedItem, setSelectedItem] = useState<MedicationCatalogItem | null>(
    null,
  )
  const [selectedSize, setSelectedSize] = useState<MedicationSize | undefined>()
  const searchQuery = useMedicationSearch(debouncedSearch, visible)
  const items = searchQuery.data ?? []
  const showInitialLoading = searchQuery.isPending && items.length === 0
  const isLastStep = currentStep === stepCount - 1
  const canGoForward =
    currentStep === 0 ? selectedItem != null : selectedSize != null

  useEffect(() => {
    if (!visible) {
      return
    }
    setSearch("")
    setDebouncedSearch("")
    setCurrentStep(0)
    setSelectedItem(null)
    setSelectedSize(undefined)
  }, [visible])

  const close = () => {
    onClose()
  }

  const goBack = () => {
    if (currentStep === 0) {
      close()
      return
    }
    setCurrentStep((step) => step - 1)
  }

  const goForward = () => {
    if (currentStep === 0 && selectedItem != null) {
      setCurrentStep(1)
      return
    }
    if (selectedItem != null && selectedSize != null) {
      onSubmit({
        catalogId: selectedItem.id,
        name: selectedItem.name,
        size: selectedSize,
      })
    }
  }

  const updateSearch = (value: string, immediate = false) => {
    setSearch(value)
    if (immediate) {
      setDebouncedSearch(value)
      return
    }
    debounceSearch(() => {
      setDebouncedSearch(value)
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={close}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: HexColorUtils.hexWithAlpha(
            "#000000",
            0.5  
          ),
        }}
        onPress={close}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface.color,
            borderTopLeftRadius: theme.borderRadius.xxl,
            borderTopRightRadius: theme.borderRadius.xxl,
            paddingBottom: insets.bottom + theme.spacing.md,
            height: "80%",
          }}
        >
          <View
            style={{
              alignItems: "center",
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                width: 40,
                height: theme.spacing.sm,
                borderRadius: 9999,
                backgroundColor: theme.colors.neutral.color,
              }}
            />
          </View>
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
              textAlign: "center",
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            {currentStep === 0
              ? t("addMedication")
              : t("selectMedicationSize")}
          </ThemedText>
          <View style={{ flex: 1 }}>
            {currentStep === 0 ? (
              <>
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                  <SearchBar
                    value={search}
                    placeholder={t("searchMedicationPlaceholder")}
                    onValueChange={(value) => {
                      updateSearch(value ?? "")
                    }}
                    onSearch={(value) => {
                      updateSearch(value, true)
                    }}
                  />
                </View>
                {showInitialLoading ? (
                  <View
                    style={{
                      paddingVertical: theme.spacing.xxl,
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator color={theme.colors.primary.color} />
                  </View>
                ) : items.length === 0 ? (
                  <ThemedText
                    appearance="description"
                    style={{
                      ...theme.typography.body.md,
                      textAlign: "center",
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.xl,
                    }}
                  >
                    {t("noSearchResults")}
                  </ThemedText>
                ) : (
                  <VirtualList
                    data={[...items]}
                    keyExtractor={(item) => item.id}
                    style={{ marginTop: theme.spacing.md, flex: 1 }}
                    renderItem={({ item }) => {
                      const isSelected = item.id === selectedItem?.id
                      return (
                        <ListActionItem
                          title={item.name}
                          color={isSelected ? theme.colors.primary : undefined}
                          leading={<ThemedIcon icon={Pill} />}
                          trailing={
                            isSelected ? <ThemedIcon icon={Check} /> : undefined
                          }
                          onPress={() => {
                            setSelectedItem(item)
                            setSelectedSize(undefined)
                            setCurrentStep(1)
                          }}
                        />
                      )
                    }}
                  />
                )}
              </>
            ) : (
              <View style={{ paddingHorizontal: theme.spacing.md }}>
                {selectedItem ? (
                  <ThemedText
                    appearance="description"
                    style={{
                      ...theme.typography.body.md,
                      textAlign: "center",
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    {selectedItem.name}
                  </ThemedText>
                ) : null}
                {MedicationSizeUtils.array.map((size) => {
                  const isSelected = size === selectedSize
                  return (
                    <ListActionItem
                      key={size}
                      title={t("medicationSize", { size })}
                      color={isSelected ? theme.colors.primary : undefined}
                      trailing={
                        isSelected ? <ThemedIcon icon={Check} /> : undefined
                      }
                      onPress={() => {
                        setSelectedSize(size)
                      }}
                    />
                  )
                })}
              </View>
            )}
          </View>
          <Stepper
            stepCount={stepCount}
            currentStep={currentStep}
            onBack={goBack}
            onForward={goForward}
            forwardLabel={isLastStep ? t("done") : t("next")}
            forwardDisabled={!canGoForward || isSubmitting}
          />
        </Pressable>
      </Pressable>
    </Modal>
  )
}
