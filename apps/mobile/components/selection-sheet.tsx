import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { Check } from "lucide-react-native"
import { useEffect, useRef } from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

export type SelectionSheetOption = {
  id: string
  label: string
}

type SelectionSheetProps = {
  visible: boolean
  title: string
  options: ReadonlyArray<SelectionSheetOption>
  value: string
  onChange: (value: string) => void
  onCancel: () => void
  onDone: () => void
}

export function SelectionSheet({
  visible,
  title,
  options,
  value,
  onChange,
  onCancel,
  onDone,
}: SelectionSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const originalValueRef = useRef(value)

  useEffect(() => {
    if (visible) {
      originalValueRef.current = value
    }
  }, [visible])

  const revertAndCancel = () => {
    onChange(originalValueRef.current)
    onCancel()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={revertAndCancel}
    >
      <Pressable style={styles.overlay} onPress={revertAndCancel}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.semantic.surface },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: theme.semantic.textPrimary }]}>
            {title}
          </Text>

          <View style={styles.options}>
            {options.map((option) => {
              const isSelected = value === option.id

              return (
                <Pressable
                  key={option.id}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.id)
                  }}
                >
                  <View style={styles.checkSlot}>
                    {isSelected ? (
                      <Check size={18} color={theme.semantic.primary} />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: theme.semantic.textPrimary,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View
            style={[
              styles.actions,
              { borderTopColor: theme.components.tabBar.border },
            ]}
          >
            <Pressable style={styles.actionButton} onPress={revertAndCancel}>
              <Text
                style={[
                  styles.actionLabel,
                  { color: theme.semantic.textSecondary },
                ]}
              >
                {t("cancel")}
              </Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onDone}>
              <Text
                style={[styles.actionLabel, { color: theme.semantic.primary }]}
              >
                {t("done")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: azdLayout.space[5],
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderRadius: azdLayout.radius.lg,
    overflow: "hidden",
    paddingTop: azdLayout.space[4],
  },
  title: {
    fontFamily: azdLayout.font.display,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: azdLayout.space[3],
    paddingHorizontal: azdLayout.space[4],
  },
  options: {
    paddingHorizontal: azdLayout.space[2],
    paddingBottom: azdLayout.space[2],
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: azdLayout.space[2],
    minHeight: 48,
    paddingHorizontal: azdLayout.space[3],
    borderRadius: azdLayout.radius.sm,
  },
  checkSlot: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: azdLayout.space[4],
  },
  actionLabel: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 16,
  },
})
