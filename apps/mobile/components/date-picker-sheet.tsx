import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toIsoDate } from "@app-zum-doc/utils/api"
import { IconButton, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { ChevronLeft, ChevronRight, X } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { Modal, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type DatePickerSheetProps = {
  visible: boolean
  title: string
  value?: string
  isDateEnabled: (date: Date) => boolean
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
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}

export function DatePickerSheet({
  visible,
  title,
  value,
  isDateEnabled,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const today = startOfToday()
  const initial = value ? parseIsoLocal(value) : today
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  )

  useEffect(() => {
    if (!visible) {
      return
    }
    const next = value ? parseIsoLocal(value) : startOfToday()
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }, [value, visible])

  const weekdayLabels = useMemo(
    () => weekdayShortLabels(),
    [],
  )
  const cells = monthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth())
  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: theme.semantics.withAppearance({
            color: "#000000",
            appearance: "faded",
          }),
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
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
              accessibilityLabel={t("back")}
              onPress={() => {
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }}
            />
            <ThemedText
              style={{
                ...theme.typography.body.md,
                fontWeight: theme.fontWeights.semibold,
              }}
            >
              {monthLabel}
            </ThemedText>
            <IconButton
              icon={ChevronRight}
              size="sm"
              variant="foreground"
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
                  ...theme.typography.body.sm,
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
              const enabled = date >= today && isDateEnabled(date)
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
                    color={selected ? theme.colors.primary : theme.colors.surface}
                    coloringStyle="filled"
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 9999,
                      opacity: enabled ? 1 : theme.config.appearancePercentages.faded,
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
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
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
