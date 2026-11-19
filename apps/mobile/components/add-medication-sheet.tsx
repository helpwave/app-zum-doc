import { AppZumDocLogo } from "@/components/app-zum-doc-logo"
import { BottomSheetOverlay } from "@/components/bottom-sheet-overlay"
import { Stepper } from "@/components/stepper"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  MedicalProductSearchUnavailableError,
  MedicationSizeUtils,
  type MedicationCatalogItem,
  type MedicationSize,
  type Substance,
} from "@app-zum-doc/utils/api"
import { useMedicationSearch } from "@app-zum-doc/utils/hooks"
import {
  Button,
  IconButton,
  ListActionItem,
  SearchBar,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { useDebouncer } from "@helpwave/hightide-utils/hooks"
import { useRouter, type Href } from "expo-router"
import { Camera, Check, Pill, RotateCcw } from "lucide-react-native"
import { useState } from "react"
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

type MedicationSheetState = {
  search: string
  debouncedSearch: string
  page: number
  items: MedicationCatalogItem[]
  currentStep: number
  selectedItem: MedicationCatalogItem | null
  selectedSize: MedicationSize | undefined
  openedPzn: string | null
}

const emptyMedicationSheetState: MedicationSheetState = {
  search: "",
  debouncedSearch: "",
  page: 1,
  items: [],
  currentStep: 0,
  selectedItem: null,
  selectedSize: undefined,
  openedPzn: null,
}

function openSinglePzn(current: MedicationSheetState) {
  const pzn = current.debouncedSearch.trim()
  const item = current.items[0]
  if (
    current.currentStep !== 0
    || current.items.length !== 1
    || item == null
    || !/^\d{8}$/.test(pzn)
    || current.openedPzn === pzn
  ) {
    return current
  }
  return {
    ...current,
    openedPzn: pzn,
    selectedItem: item,
    selectedSize: item.size,
    currentStep: 1,
  }
}

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
  const router = useRouter()
  const debounceSearch = useDebouncer()
  const [sheet, setSheet] = useState<MedicationSheetState>(initialItem ? {
    ...emptyMedicationSheetState,
    selectedItem: initialItem,
    selectedSize: initialItem.size
  } : emptyMedicationSheetState)
  const {
    search,
    debouncedSearch,
    page,
    items,
    currentStep,
    selectedItem,
    selectedSize,
  } = sheet
  const searchQuery = useMedicationSearch({
    parameters: {
      search: debouncedSearch,
      page,
    },
    enabled: visible && currentStep === 0,
    retry: false,
  })
  const [prevSearchData, setPrevSearchData] = useState(searchQuery.data)
  if(searchQuery.data !== prevSearchData) {
    const pageData = searchQuery.data
    setPrevSearchData(pageData)
    if (pageData) {
      setSheet((current) => {
        if (current.page !== pageData.page) {
          return current
        }
        const withItems = pageData.page === 1
          ? { ...current, items: pageData.results }
          : {
            ...current,
            items: [
              ...current.items,
              ...pageData.results.filter((item) => {
                return !current.items.some((existing) => existing.id === item.id)
              }),
            ],
          }
        if (searchQuery.isFetching) {
          return withItems
        }
        return openSinglePzn(withItems)
      })
    }
  }

  const showInitialLoading = searchQuery.isPending && page === 1 && items.length === 0
  const isLastStep = currentStep === stepCount - 1
  const canGoForward =
    currentStep === 0 ? selectedItem != null : selectedSize != null

  const close = () => {
    onClose()
  }

  const goBack = () => {
    if (currentStep === 0) {
      close()
      return
    }
    setSheet((current) => ({
      ...current,
      currentStep: current.currentStep - 1,
    }))
  }

  const goForward = () => {
    if (currentStep === 0 && selectedItem != null) {
      setSheet((current) => ({ ...current, currentStep: 1 }))
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
    setSheet((current) => ({
      ...current,
      search: value,
      page: 1,
      ...(immediate ? { debouncedSearch: value } : {}),
    }))
    if (immediate) {
      return
    }
    debounceSearch(() => {
      setSheet((current) => ({
        ...current,
        page: 1,
        debouncedSearch: value,
      }))
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
        <View
          style={{
            justifyContent: "center",
            minHeight: theme.semantics.touchTargetSize({}),
            marginBottom: theme.spacing.lg,
          }}
        >
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
              textAlign: "center",
              paddingHorizontal: theme.spacing.lg + theme.semantics.touchTargetSize({}),
            }}
          >
            {currentStep === 0
              ? t("addMedication")
              : t("selectMedicationSize")}
          </ThemedText>
          {currentStep === 0 ? (
            <View
              style={{
                position: "absolute",
                right: theme.spacing.md,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <IconButton
                icon={Camera}
                size="sm"
                variant="foreground"
                color={theme.colors.surfaceInverse}
                accessibilityLabel={t("scanMedication")}
                onPress={() => {
                  onClose()
                  router.push("/scan-medication" as Href)
                }}
              />
            </View>
          ) : null}
        </View>
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
                      setSheet((current) => ({ ...current, page: current.page + 1 }))
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
                          setSheet((current) => ({
                            ...current,
                            selectedItem: item,
                            selectedSize: item.size,
                            currentStep: 1,
                          }))
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
                      setSheet((current) => ({ ...current, selectedSize: size }))
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
