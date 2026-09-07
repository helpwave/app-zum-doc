import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { ColorPairToken } from "@helpwave/hightide-design/theme-tokens"
import { Button, Modal, ThemedText } from "@helpwave/hightide-native/components"
import { View } from "react-native"

type ConfirmationModalProps = {
  isOpen: boolean
  onIsOpenChange: (isOpen: boolean) => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: ColorPairToken
  onConfirm?: () => void
}

export function ConfirmationModal({
  isOpen,
  onIsOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor,
  onConfirm,
}: ConfirmationModalProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const resolvedConfirmLabel = confirmLabel ?? t("understood")

  const close = () => {
    onIsOpenChange(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onIsOpenChange={onIsOpenChange}
      showCloseButton={false}
    >
      <View style={{ gap: theme.spacing.lg, padding: theme.padding.xl }}>
        <View style={{ gap: theme.spacing.sm }}>
          <ThemedText
            style={{
              ...theme.typography.heading.lg,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            {title}
          </ThemedText>
          <ThemedText
            appearance="description"
            style={theme.typography.body.md}
          >
            {message}
          </ThemedText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {cancelLabel ? (
            <Button
              variant="tonal"
              onPress={close}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            color={confirmColor}
            onPress={() => {
              onConfirm?.()
              close()
            }}
          >
            {resolvedConfirmLabel}
          </Button>
        </View>
      </View>
    </Modal>
  )
}
