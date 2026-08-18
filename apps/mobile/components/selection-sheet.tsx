import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { Button, ListActionItem } from "@helpwave/hightide-native/components"
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
  options: readonly SelectionSheetOption[]
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
  }, [value, visible])

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
            { backgroundColor: theme.colors.surface.color },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: theme.colors.surface.onColor }]}>
            {title}
          </Text>

          <View style={styles.options}>
            {options.map((option) => {
              const isSelected = value === option.id

              return (
                <ListActionItem
                  key={option.id}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.id)
                  }}
                  leading={(
                    <View style={styles.checkSlot}>
                      {isSelected ? (
                        <Check size={theme.icongraphy.sizes.md} color={theme.colors.primary.color} />
                      ) : null}
                    </View>
                  )}
                  title={option.label}
                />
              )
            })}
          </View>

          <View
            style={[
              styles.actions,
              { borderTopColor: theme.components.tabBar.border },
            ]}
          >
            <Button 
              onPress={revertAndCancel}
              variant="foreground"
              color={{
                color: theme.colors.surface.onColor, 
                onColor: theme.colors.surface.color
              }} 
              style={{flex: 1}}
            >
              {t("cancel")}
            </Button>
            <Button onPress={onDone} variant="foreground" style={{flex: 1}}>
              {t("done")}
            </Button>
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
  actionLabel: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 16,
  },
})
