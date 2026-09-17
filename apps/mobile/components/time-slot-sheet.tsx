import { BottomSheetOverlay } from "@/components/bottom-sheet-overlay"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { isMorningSlot } from "@app-zum-doc/utils/api"
import { IconButton, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { X } from "lucide-react-native"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type TimeSlotSheetProps = {
  visible: boolean
  title: string
  slots: readonly string[]
  value?: string
  onSelect: (time: string) => void
  onClose: () => void
}

export function TimeSlotSheet({
  visible,
  title,
  slots,
  value,
  onSelect,
  onClose,
}: TimeSlotSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const morning = slots.filter((slot) => isMorningSlot(slot))
  const afternoon = slots.filter((slot) => !isMorningSlot(slot))

  return (
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
            size="sm"
            color={theme.colors.surfaceInverse}
            variant="foreground"
            accessibilityLabel={t("cancel")}
            onPress={onClose}
          />
        </View>
        {slots.length === 0 ? (
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.md,
              textAlign: "center",
              paddingVertical: theme.spacing.xl,
            }}
          >
            {t("noTimeSlots")}
          </ThemedText>
        ) : (
          <View style={{ gap: theme.spacing.xl }}>
            {morning.length > 0 ? (
              <TimeSlotGroup
                title={t("morning")}
                slots={morning}
                value={value}
                onSelect={onSelect}
              />
            ) : null}
            {afternoon.length > 0 ? (
              <TimeSlotGroup
                title={t("afternoon")}
                slots={afternoon}
                value={value}
                onSelect={onSelect}
              />
            ) : null}
          </View>
        )}
      </View>
    </BottomSheetOverlay>
  )
}

function TimeSlotGroup({
  title,
  slots,
  value,
  onSelect,
}: {
  title: string
  slots: readonly string[]
  value?: string
  onSelect: (time: string) => void
}) {
  const { theme } = useAzdTheme()

  return (
    <View style={{ gap: theme.spacing.md }}>
      <ThemedText
        appearance="description"
        style={theme.typography.body.sm}
      >
        {title}
      </ThemedText>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.md,
        }}
      >
        {slots.map((slot) => {
          const selected = slot === value
          return (
            <ThemedPressable
              key={slot}
              onPress={() => {
                onSelect(slot)
              }}
              color={selected ? theme.colors.primary : theme.colors.surfaceInverse}
              coloringStyle={selected ? "filled" : "foreground"}
              style={{
                width: "21%",
                flexGrow: 1,
                maxWidth: "25%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText
                style={{
                  ...theme.typography.body.md,
                  fontWeight: theme.fontWeights.bold,
                }}
              >
                {slot}
              </ThemedText>
            </ThemedPressable>
          )
        })}
      </View>
    </View>
  )
}
