import { BottomSheetOverlay } from "@/components/bottom-sheet-overlay"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toIsoDate } from "@app-zum-doc/utils/api"
import { Button, IconButton, ListActionItem, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type DatePickerSheetProps = {
  visible: boolean
  title: string
  value?: string
  startDate?: string
  endDate?: string
  isDateEnabled: (date: Date) => boolean
  hasYearSelect?: boolean
  onSelect: (isoDate: string) => void
  onClose: () => void
}

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length < 42) {
    cells.push(null)
  }
  return cells
}

export function DatePickerSheet({
  visible,
  title,
  value,
  startDate,
  endDate,
  isDateEnabled,
  hasYearSelect = false,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const today = startOfToday()
  const rangeStart = startDate ? parseIsoLocal(startDate) : today
  const rangeEnd = endDate ? parseIsoLocal(endDate) : undefined
  const initial = value ? parseIsoLocal(value) : today
  const [visibleMonth, setVisibleMonth] = useState(
    () => clampMonthToRange(
      new Date(initial.getFullYear(), initial.getMonth(), 1),
      rangeStart,
      rangeEnd,
    ),
  )
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false)

  useEffect(() => {
    if (!visible) {
      setIsYearSelectOpen(false)
      return
    }
    const nextToday = startOfToday()
    const start = startDate ? parseIsoLocal(startDate) : nextToday
    const end = endDate ? parseIsoLocal(endDate) : undefined
    const next = value ? parseIsoLocal(value) : nextToday
    setVisibleMonth(
      clampMonthToRange(
        new Date(next.getFullYear(), next.getMonth(), 1),
        start,
        end,
      ),
    )
  }, [endDate, startDate, value, visible])

  const canGoToPreviousMonth = monthIntersectsRange(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() - 1,
    rangeStart,
    rangeEnd,
  )
  const canGoToNextMonth = monthIntersectsRange(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    rangeStart,
    rangeEnd,
  )

  const weekdayLabels = useMemo(
    () => weekdayShortLabels(),
    [],
  )
  const cells = monthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth())
  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
  const monthOnlyLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
  })
  const years = useMemo(() => {
    const startYear = rangeStart.getFullYear()
    const endYear = (rangeEnd ?? startOfToday()).getFullYear()
    const list: number[] = []
    for (let year = endYear; year >= startYear; year -= 1) {
      list.push(year)
    }
    return list
  }, [rangeEnd, rangeStart])

  return (
    <>
      <BottomSheetOverlay visible={visible} onClose={onClose}>
        <View
          style={{
            backgroundColor: theme.colors.surface.color,
            borderTopLeftRadius: theme.borderRadius.xxl,
            borderTopRightRadius: theme.borderRadius.xxl,
            paddingBottom: insets.bottom + theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <View style={{ width: theme.semantics.control.sm.size }} />
            <ThemedText
              style={{
                ...theme.typography.heading.md,
                fontWeight: theme.fontWeights.bold,
                textAlign: "center",
                flex: 1,
              }}
            >
              {title}
            </ThemedText>
            <IconButton
              icon={X}
              color={theme.colors.surfaceInverse}
              size="sm"
              variant="foreground"
              accessibilityLabel={t("cancel")}
              onPress={onClose}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.md,
            }}
          >
            <IconButton
              icon={ChevronLeft}
              size="sm"
              variant="foreground"
              disabled={!canGoToPreviousMonth}
              accessibilityLabel={t("back")}
              onPress={() => {
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }}
            />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.sm,
              }}
            >
              <ThemedText
                style={{
                  ...theme.typography.body.md,
                  fontWeight: theme.fontWeights.semibold,
                }}
              >
                {hasYearSelect ? monthOnlyLabel : monthLabel}
              </ThemedText>
              {hasYearSelect ? (
                <Button
                  size="sm"
                  variant="foreground"
                  trailingIcon={ChevronDown}
                  accessibilityLabel={t("selectYear")}
                  onPress={() => {
                    setIsYearSelectOpen(true)
                  }}
                >
                  {String(visibleMonth.getFullYear())}
                </Button>
              ) : null}
            </View>
            <IconButton
              icon={ChevronRight}
              size="sm"
              variant="foreground"
              disabled={!canGoToNextMonth}
              accessibilityLabel={t("next")}
              onPress={() => {
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                )
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: theme.spacing.sm,
            }}
          >
            {weekdayLabels.map((label) => (
              <ThemedText
                key={label}
                appearance="description"
                style={{
                  flex: 1,
                  textAlign: "center",
                  ...theme.typography.body.md,
                }}
              >
                {label}
              </ThemedText>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cells.map((date, index) => {
              if (!date) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={{ width: "14.28%", aspectRatio: 1 }}
                  />
                )
              }
              const iso = toIsoDate(date)
              const selected = value === iso
              const enabled = isDateInRange(date, rangeStart, rangeEnd)
                && isDateEnabled(date)
              return (
                <View
                  key={iso}
                  style={{
                    width: "14.28%",
                    aspectRatio: 1,
                    padding: theme.spacing.xs,
                  }}
                >
                  <ThemedPressable
                    disabled={!enabled}
                    onPress={() => {
                      onSelect(iso)
                    }}
                    color={selected ? theme.colors.primary : theme.colors.neutral}
                    coloringStyle="filled"
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      ...StyleAdapterUtils.borderRadius({ type: "all",value: 9999 }),
                      opacity: enabled ? 1 : theme.config.appearancePercentages.faded,
                    }}
                    stateLayerStyle={{
                      ...StyleAdapterUtils.borderRadius({ type: "all",value: 9999 }),
                    }}
                  >
                    <ThemedText
                      style={{
                        ...theme.typography.body.md,
                        fontWeight: selected
                          ? theme.fontWeights.bold
                          : theme.fontWeights.medium,
                      }}
                    >
                      {String(date.getDate())}
                    </ThemedText>
                  </ThemedPressable>
                </View>
              )
            })}
          </View>
        </View>
      </BottomSheetOverlay>
      {hasYearSelect && isYearSelectOpen ? (
        <YearSelectSheet
          visible={visible}
          years={years}
          selectedYear={visibleMonth.getFullYear()}
          onSelect={(year) => {
            setVisibleMonth(
              clampMonthToRange(
                new Date(year, visibleMonth.getMonth(), 1),
                rangeStart,
                rangeEnd,
              ),
            )
            setIsYearSelectOpen(false)
          }}
          onClose={() => {
            setIsYearSelectOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

function YearSelectSheet({
  visible,
  years,
  selectedYear,
  onSelect,
  onClose,
}: {
  visible: boolean
  years: readonly number[]
  selectedYear: number
  onSelect: (year: number) => void
  onClose: () => void
}) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const selectedIndex = Math.max(0, years.indexOf(selectedYear))
  const rowHeight = theme.semantics.control.md.size

  return (
    <BottomSheetOverlay visible={visible} onClose={onClose}>
      <View
        style={{
          backgroundColor: theme.colors.surface.color,
          borderTopLeftRadius: theme.borderRadius.xxl,
          borderTopRightRadius: theme.borderRadius.xxl,
          paddingBottom: insets.bottom + theme.spacing.lg,
          height: "60%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ width: theme.semantics.control.sm.size }} />
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
              textAlign: "center",
              flex: 1,
            }}
          >
            {t("selectYear")}
          </ThemedText>
          <IconButton
            icon={X}
            color={theme.colors.surfaceInverse}
            size="sm"
            variant="foreground"
            accessibilityLabel={t("cancel")}
            onPress={onClose}
          />
        </View>
        <VirtualList
          data={years}
          keyExtractor={(year) => String(year)}
          initialScrollIndex={selectedIndex}
          getItemLayout={(_, index) => ({
            length: rowHeight,
            offset: rowHeight * index,
            index,
          })}
          renderItem={({ item: year }) => {
            const isSelected = year === selectedYear
            return (
              <ListActionItem
                title={String(year)}
                onPress={() => {
                  onSelect(year)
                }}
                trailing={
                  isSelected
                    ? (
                      <Check
                        size={theme.icongraphy.sizes.md}
                        color={theme.colors.primary.color}
                      />
                    )
                    : undefined
                }
                style={{
                  minHeight: rowHeight,
                  paddingHorizontal: theme.spacing.lg,
                }}
              />
            )
          }}
        />
      </View>
    </BottomSheetOverlay>
  )
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function isDateInRange(date: Date, start?: Date, end?: Date): boolean {
  if (start && date < start) {
    return false
  }
  if (end && date > end) {
    return false
  }
  return true
}

function monthIntersectsRange(
  year: number,
  month: number,
  start?: Date,
  end?: Date,
): boolean {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  if (start && monthEnd < start) {
    return false
  }
  if (end && monthStart > end) {
    return false
  }
  return true
}

function clampMonthToRange(date: Date, start?: Date, end?: Date): Date {
  const month = new Date(date.getFullYear(), date.getMonth(), 1)
  if (start) {
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    if (month < startMonth) {
      return startMonth
    }
  }
  if (end) {
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    if (month > endMonth) {
      return endMonth
    }
  }
  return month
}

function parseIsoLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function weekdayShortLabels(): string[] {
  const monday = new Date(2026, 7, 17)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  })
}
