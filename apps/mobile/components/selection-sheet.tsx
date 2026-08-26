import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { withAlpha } from "@/theme/azd-theme"
import { Button, ListActionItem } from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Check } from "lucide-react-native"
import { useEffect, useRef } from "react"
import {
  Modal,
  Pressable,
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
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      animationType="fade"
      onRequestClose={revertAndCancel}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: theme.spacing.lg + theme.spacing.sm,
          backgroundColor: withAlpha(
            "#000000",
            theme.config.appearancePercentages.faded,
          ),
        }}
        onPress={revertAndCancel}
      >
        <Pressable
          style={{
            borderRadius: theme.borderRadius.xl,
            overflow: "hidden",
            paddingTop: theme.spacing.lg,
            backgroundColor: theme.colors.surface.color,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <Text
            style={{
              ...theme.typography.heading.md,
              fontWeight: theme.fontWeights.bold,
              textAlign: "center",
              marginBottom: theme.spacing.md + theme.spacing.sm,
              paddingHorizontal: theme.spacing.lg,
              color: theme.colors.surface.onColor,
            }}
          >
            {title}
          </Text>

          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.md,
            }}
          >
            {options.map((option) => {
              const isSelected = value === option.id

              return (
                <ListActionItem
                  key={option.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.md,
                    minHeight: theme.semantics.control.md.size,
                    paddingHorizontal: theme.spacing.md + theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                  }}
                  onPress={() => {
                    onChange(option.id)
                  }}
                  leading={(
                    <View
                      style={{
                        width: theme.icongraphy.sizes.md,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
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
            style={{
              flexDirection: "row",
              borderTopWidth: theme.borderWidth.thin,
              borderTopColor: theme.components.tabBar.border,
            }}
          >
            <Button
              onPress={revertAndCancel}
              variant="foreground"
              color={{
                color: theme.colors.surface.onColor,
                onColor: theme.colors.surface.color
              }}
              style={{
                flex: 1,
                ...StyleAdapterUtils.borderRadius({ type: "all", value: 0 }),
              }}
              stateLayerStyle={{
                ...StyleAdapterUtils.borderRadius({ type: "all", value: 0 }),
              }}
            >
              {t("cancel")}
            </Button>
            <Button 
              onPress={onDone}
              variant="foreground"
              style={{
                flex: 1,
                ...StyleAdapterUtils.borderRadius({ type: "all", value: 0 }),
              }}
              stateLayerStyle={{
                ...StyleAdapterUtils.borderRadius({ type: "all", value: 0 }),
              }}
            >
              {t("done")}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
