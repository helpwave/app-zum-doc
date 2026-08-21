import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  ChatMessageComposer,
  IconButton,
} from "@helpwave/hightide-native/components"
import { Camera, Plus } from "lucide-react-native"
import { Text, ViewStyle } from "react-native"

type ComposerProps = {
  placeholder?: string
  onSend: (text: string) => void
  isSending?: boolean
  errorMessage?: string | null,
  style?: ViewStyle,
}

export function Composer({
  placeholder = "Nachricht …",
  onSend,
  isSending = false,
  errorMessage = null,
  style,
}: ComposerProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.composer

  return (
    <>
      {errorMessage ? (
        <Text
          style={{
            ...theme.typography.body.sm,
            color: colors.errorText,
            paddingHorizontal: theme.spacing.lg - theme.spacing.xs,
            paddingTop: theme.spacing.md,
            backgroundColor: colors.errorBackground,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}
      <ChatMessageComposer
        placeholder={placeholder}
        onSend={onSend}
        disabled={isSending}
        sendLabel="Nachricht senden"
        actions={
          <IconButton
            accessibilityLabel="Anhang hinzufügen"
            icon={Plus}
            size="sm"
            color={theme.colors.neutral}
            style={{ borderRadius: 9999 }}
            stateLayerStyle={{ borderRadius: 9999 }}
          />
        }
        trailing={
          <IconButton
            accessibilityLabel="Foto aufnehmen"
            icon={Camera}
            size="sm"
            color={theme.colors.neutral}
            style={{marginInlineEnd: theme.spacing.sm, borderRadius: 9999 }}
            stateLayerStyle={{ borderRadius: 9999 }}
          />
        }
        style={style}
      />
    </>
  )
}
