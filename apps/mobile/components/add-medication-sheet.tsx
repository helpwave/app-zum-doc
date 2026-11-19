import { AppZumDocLogo } from "@/components/app-zum-doc-logo"
import { BottomSheetOverlay } from "@/components/bottom-sheet-overlay"
import { Stepper } from "@/components/stepper"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  medicationSizeFromPackageSize,
  MedicalProductSearchUnavailableError,
  MedicationSizeUtils,
  type MedicationCatalogItem,
  type MedicationSize,
  type Substance,
} from "@app-zum-doc/utils/api"
import { useMedicationSearch } from "@app-zum-doc/utils/hooks"
import {
  Button,
  ListActionItem,
  SearchBar,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { useDebouncer } from "@helpwave/hightide-utils/hooks"
import { Check, Pill, RotateCcw } from "lucide-react-native"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type AddMedicationSheetProps = {
  visible: boolean
  isSubmitting?: boolean
  initialItem?: MedicationCatalogItem | null
  onSubmit: (selection: {
    catalogId: string
    name: string
    size: MedicationSize
    ingredient: Substance[]
  }) => void
  onClose: () => void
}

const stepCount = 2

function substanceLabel(ingredient: Substance[]) {
  const label = ingredient
    .map((substance) => `${substance.name} ${substance.strength}`.trim())
    .filter((value) => value.length > 0)
    .join(", ")
  return label.length > 0 ? label : undefined
}

export function AddMedicationSheet({
  visible,
  isSubmitting = false,
  initialItem = null,
  onSubmit,
  onClose,
}: AddMedicationSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const debounceSearch = useDebouncer()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<MedicationCatalogItem[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedItem, setSelectedItem] = useState<MedicationCatalogItem | null>(
    null,
  )
  const [selectedSize, setSelectedSize] = useState<MedicationSize | undefined>()
  const [openedPzn, setOpenedPzn] = useState<string | null>(null)
  const searchQuery = useMedicationSearch({
    parameters: {
      search: debouncedSearch,
      page,
    },
    enabled: visible && currentStep === 0,
    retry: false,
  })
  const showInitialLoading = searchQuery.isPending && page === 1 && items.length === 0
  const isLastStep = currentStep === stepCount - 1
  const canGoForward =
    currentStep === 0 ? selectedItem != null : selectedSize != null

  useEffect(() => {
    if (!visible) {
      return
    }
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
    setItems([])
    setSelectedSize(
      initialItem ? medicationSizeFromPackageSize(initialItem.packageSize) : undefined,
    )
    setOpenedPzn(null)
    if (initialItem) {
      setSelectedItem(initialItem)
      setCurrentStep(1)
      return
    }
    setSelectedItem(null)
    setCurrentStep(0)
  }, [visible, initialItem])

  useEffect(() => {
    const pageData = searchQuery.data
    if (!pageData || pageData.page !== page) {
      return
    }
    setItems((current) => {
      if (page === 1) {
        return pageData.results
      }
      const seen = new Set(current.map((item) => item.id))
      return [
        ...current,
        ...pageData.results.filter((item) => !seen.has(item.id)),
      ]
    })
  }, [page, searchQuery.data])

  useEffect(() => {
    const pzn = debouncedSearch.trim()
    if (currentStep !== 0 || !/^\d{8}$/.test(pzn) || items.length !== 1) {
      return
    }
    if (searchQuery.isFetching || openedPzn === pzn) {
      return
    }
    setOpenedPzn(pzn)
    const item = items[0]
    if (item == null) {
      return
    }
    setSelectedItem(item)
    setSelectedSize(medicationSizeFromPackageSize(item.packageSize))
    setCurrentStep(1)
  }, [currentStep, debouncedSearch, items, openedPzn, searchQuery.isFetching])

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
        ingredient: selectedItem.ingredient,
      })
    }
  }

  const updateSearch = (value: string, immediate = false) => {
    setSearch(value)
    setPage(1)
    if (immediate) {
      setDebouncedSearch(value)
      return
    }
    debounceSearch(() => {
      setPage(1)
      setDebouncedSearch(value)
    })
  }

  return (
    <BottomSheetOverlay visible={visible} onClose={close}>
      <View
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
                  <AppZumDocLogo animate="loading" height={128} width={128} />
                </View>
              ) : searchQuery.isError ? (
                <View
                  style={{
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.xl,
                    alignItems: "center",
                    gap: theme.spacing.md,
                  }}
                >
                  <ThemedText
                    appearance="description"
                    style={{
                      ...theme.typography.body.md,
                      textAlign: "center",
                    }}
                  >
                    {searchQuery.error instanceof MedicalProductSearchUnavailableError
                      ? t("medicationSearchUnavailable")
                      : searchQuery.error?.message ?? t("errorUnknown")}
                  </ThemedText>
                  <Button
                    size="md"
                    onPress={() => {
                      void searchQuery.refetch()
                    }}
                    leadingIcon={RotateCcw}
                  >
                    {t("retry")}
                  </Button>
                </View>
              ) : items.length === 0 && debouncedSearch.trim().length > 0 ? (
                <ThemedText
                  appearance="description"
                  style={{
                    ...theme.typography.body.md,
                    textAlign: "center",
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.xl,
                  }}
                >
                  {/^\d{8}$/.test(debouncedSearch.trim())
                    ? t("noPznSearchResults")
                    : t("noSearchResults")}
                </ThemedText>
              ) : (
                <VirtualList
                  data={items}
                  keyExtractor={(item) => item.id}
                  style={{ marginTop: theme.spacing.md, flex: 1 }}
                  onEndReached={() => {
                    if (searchQuery.data?.hasMore && !searchQuery.isFetching) {
                      setPage((value) => value + 1)
                    }
                  }}
                  renderItem={({ item }) => {
                    const isSelected = item.id === selectedItem?.id
                    return (
                      <ListActionItem
                        title={item.name}
                        subtitle={substanceLabel(item.ingredient)}
                        color={isSelected ? theme.colors.primary : undefined}
                        leading={<ThemedIcon icon={Pill} />}
                        trailing={
                          isSelected ? <ThemedIcon icon={Check} /> : undefined
                        }
                        onPress={() => {
                          setSelectedItem(item)
                          setSelectedSize(medicationSizeFromPackageSize(item.packageSize))
                          setCurrentStep(1)
                        }}
                        style={{
                          ...StyleAdapterUtils.padding({
                            type: "physicalAxis",
                            horizontal: theme.spacing.lg + theme.padding.md
                          })
                        }}
                      />
                    )
                  }}
                />
              )}
            </>
          ) : (
            <View>
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
                    style={{
                      ...StyleAdapterUtils.padding({
                        type: "physicalAxis",
                        horizontal: theme.spacing.lg + theme.padding.md
                      })
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
          forwardDisabled={!canGoForward}
          forwardIsProcessing={isLastStep && isSubmitting}
          backDisabled={isSubmitting}
        />
      </View>
    </BottomSheetOverlay>
  )
}
