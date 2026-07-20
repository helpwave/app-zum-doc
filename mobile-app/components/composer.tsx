import { Camera, Plus, SendHorizontal } from "lucide-react-native"
import { useState } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { azd } from "@/theme/azd-tokens"

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
  const [value, setValue] = useState("")

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isSending) {
      return
    }
    onSend(trimmed)
    setValue("")
  }

  return (
    <View style={styles.wrap}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.row}>
        <Pressable
          style={styles.plusButton}
          accessibilityRole="button"
          accessibilityLabel="Anhang hinzufügen"
        >
          <Plus size={20} color={azd.green[600]} />
        </Pressable>
        <View style={styles.inputShell}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={azd.fg[7]}
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="send"
            editable={!isSending}
          />
          <Camera size={20} color={azd.fg[6]} />
        </View>
        <Pressable
          onPress={submit}
          disabled={isSending || value.trim().length === 0}
          style={[
            styles.sendButton,
            (isSending || value.trim().length === 0) && styles.sendDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Nachricht senden"
        >
          <SendHorizontal size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: azd.bg.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: azd.divider,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 8,
  },
  error: {
    fontFamily: azd.font.display,
    fontSize: 12,
    color: azd.semantic.danger,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  plusButton: {
    width: 38,
    height: 38,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    alignItems: "center",
    justifyContent: "center",
  },
  inputShell: {
    flex: 1,
    height: 44,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: azd.font.display,
    fontSize: 15,
    color: azd.fg[1],
    paddingVertical: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.green[600],
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.45,
  },
})
