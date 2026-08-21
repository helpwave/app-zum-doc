import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { isMorningSlot } from "@app-zum-doc/utils/api"
import { IconButton, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { X } from "lucide-react-native"
import { Modal, Pressable, View } from "react-native"
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
            colorPair: theme.colors.surface,
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
        </Pressable>
      </Pressable>
    </Modal>
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
              color={selected ? theme.colors.primary : theme.colors.surface}
              coloringStyle={selected ? "filled" : "foreground"}
              style={{
                width: "22%",
                flexGrow: 1,
                maxWidth: "23.5%",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                borderWidth: theme.borderWidth.thin,
                borderColor: selected
                  ? theme.colors.primary.color
                  : theme.colors.neutral.color,
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
