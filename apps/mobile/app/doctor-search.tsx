import { DoctorCard } from "@/components/doctor-card"
import { FilterChip } from "@/components/filter-chip"
import { FilterSearchSheet } from "@/components/filter-search-sheet"
import { QueryState } from "@/components/query-state"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { AppLocale } from "@app-zum-doc/utils/api"
import {
  useCities,
  useDoctorSearch,
  useSpecializations,
} from "@app-zum-doc/utils/hooks"
import { IconButton, SearchBar, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useDebouncer } from "@helpwave/hightide-utils/hooks"
import { useRouter } from "expo-router"
import { BriefcaseMedical, ChevronLeft, MapPin } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

function toAppLocale(locale: string): AppLocale {
  return locale === "en-US" ? "en-US" : "de-DE"
}

export default function DoctorSearchScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colors = theme.components.screen
  const headerColors = theme.components.screenHeader
  const debounceQuery = useDebouncer()
  const debounceCity = useDebouncer()
  const debounceSpecialization = useDebouncer()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [city, setCity] = useState<{ id: string, label: string } | null>(null)
  const [specialization, setSpecialization] = useState<{
    id: string
    label: string
  } | null>(null)
  const [openSheet, setOpenSheet] = useState<"city" | "specialization" | null>(null)
  const [citySearch, setCitySearch] = useState("")
  const [debouncedCitySearch, setDebouncedCitySearch] = useState("")
  const [specializationSearch, setSpecializationSearch] = useState("")
  const [debouncedSpecializationSearch, setDebouncedSpecializationSearch] =
    useState("")

  const doctorsQuery = useDoctorSearch({
    query: debouncedQuery,
    cityId: city?.id,
    specializationId: specialization?.id,
    locale,
  })
  const citiesQuery = useCities(
    debouncedCitySearch,
    locale,
    openSheet === "city",
  )
  const specializationsQuery = useSpecializations(
    debouncedSpecializationSearch,
    locale,
    openSheet === "specialization",
  )

  const doctors = doctorsQuery.data ?? []
  const cityItems = useMemo(
    () => citiesQuery.data ?? [],
    [citiesQuery.data],
  )
  const specializationItems = useMemo(
    () => specializationsQuery.data ?? [],
    [specializationsQuery.data],
  )

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg - theme.spacing.xs,
          paddingBottom: theme.spacing.lg - theme.spacing.xs,
          borderBottomWidth: theme.border.thin,
          borderBottomColor: headerColors.border,
          backgroundColor: headerColors.background,
        }}
      >
        <IconButton
          icon={ChevronLeft}
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={() => router.back()}
          variant="foreground"
        />
        <Text
          style={{
            ...theme.typography.heading.md,
            color: headerColors.title,
          }}
        >
          {t("searchDoctor")}
        </Text>
        <View
          style={{
            width: theme.elements.control.xs.size,
          }}
        />
      </View>

      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          gap: theme.spacing.lg,
          flex: 1,
        }}
      >
        <SearchBar
          value={query}
          placeholder={t("searchDoctorPlaceholder")}
          onValueChange={(value) => {
            const nextValue = value ?? ""
            setQuery(nextValue)
            debounceQuery(() => {
              setDebouncedQuery(nextValue)
            })
          }}
          onSearch={(value) => {
            setQuery(value)
            setDebouncedQuery(value)
          }}
        />

        <View style={{ gap: theme.spacing.md }}>
          <ThemedText
            style={{
              ...theme.typography.heading.sm,
              fontWeight: theme.typography.fontWeights.bold,
            }}
          >
            {t("filter")}
          </ThemedText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.md,
            }}
          >
            <FilterChip
              label={city?.label ?? t("filterCity")}
              selected={city != null}
              onPress={() => {
                setOpenSheet("city")
              }}
            />
            <FilterChip
              label={specialization?.label ?? t("filterSpecialization")}
              selected={specialization != null}
              onPress={() => {
                setOpenSheet("specialization")
              }}
            />
          </View>
        </View>

        <QueryState
          isPending={doctorsQuery.isPending}
          isError={doctorsQuery.isError}
          error={doctorsQuery.error}
          onRetry={() => {
            void doctorsQuery.refetch()
          }}
          loadingLabel={t("loadingDoctorSearch")}
        >
          {doctors.length === 0 ? (
            <ThemedText
              appearance="description"
              style={{
                ...theme.typography.body.md,
                textAlign: "center",
                paddingTop: theme.spacing.xl,
              }}
            >
              {t("noSearchResults")}
            </ThemedText>
          ) : (
            <VirtualList
              data={doctors}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{
                gap: theme.spacing.md,
                paddingBottom: theme.spacing.xl,
              }}
              renderItem={({ item }) => (
                <DoctorCard
                  doctor={item}
                  width="100%"
                  onPress={() => {
                    router.push({
                      pathname: "/doctor/[id]",
                      params: { id: item.id },
                    })
                  }}
                />
              )}
            />
          )}
        </QueryState>
      </View>

      <FilterSearchSheet
        visible={openSheet === "city"}
        title={t("selectCity")}
        placeholder={t("searchCity")}
        search={citySearch}
        onSearchChange={(value) => {
          setCitySearch(value)
          debounceCity(() => {
            setDebouncedCitySearch(value)
          })
        }}
        items={cityItems}
        isPending={citiesQuery.isPending}
        selectedId={city?.id}
        leadingIcon={MapPin}
        onSelect={(id) => {
          const selected = cityItems.find((item) => item.id === id)
          if (selected) {
            setCity(selected)
          }
        }}
        onClear={() => {
          setCity(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />

      <FilterSearchSheet
        visible={openSheet === "specialization"}
        title={t("selectSpecialization")}
        placeholder={t("searchSpecialization")}
        search={specializationSearch}
        onSearchChange={(value) => {
          setSpecializationSearch(value)
          debounceSpecialization(() => {
            setDebouncedSpecializationSearch(value)
          })
        }}
        items={specializationItems}
        isPending={specializationsQuery.isPending}
        selectedId={specialization?.id}
        leadingIcon={BriefcaseMedical}
        onSelect={(id) => {
          const selected = specializationItems.find((item) => item.id === id)
          if (selected) {
            setSpecialization(selected)
          }
        }}
        onClear={() => {
          setSpecialization(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />
    </View>
  )
}
