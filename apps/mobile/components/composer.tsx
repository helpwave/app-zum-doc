import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  ChatMessageComposer,
  IconButton,
} from "@helpwave/hightide-native/components"
import { Camera, Plus } from "lucide-react-native"
import { Text } from "react-native"

type ComposerProps = {
  placeholder?: string
  onSend: (text: string) => void
  isSending?: boolean
  errorMessage?: string | null
}

export function Composer({
  placeholder = "Nachricht …",
  onSend,
  isSending = false,
  errorMessage = null,
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
            size="md"
            color={theme.colors.neutral}
            variant="foreground"
          />
        }
        trailing={
          <IconButton
            accessibilityLabel="Foto aufnehmen"
            icon={Camera}
            size="md"
            color={theme.colors.neutral}
            variant="foreground"
          />
        }
      />
    </>
  )
}
