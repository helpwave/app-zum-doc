import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  ThemedIcon,
  ThemedPressable,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useMemoizedTheme } from "@helpwave/hightide-native/hooks"
import type { IconComponent, IconStyle } from "@helpwave/hightide-native/icons"
import type { SelectState } from "@helpwave/hightide-native/theme"
import { ChevronDown } from "lucide-react-native"
import { useMemo, useState } from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"

type SelectStyleInputProps = {
  display?: string
  placeholder: string
  disabled?: boolean
  isOpen?: boolean
  icon?: IconComponent
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  onPress: () => void
}

export function SelectStyleInput({
  display,
  placeholder,
  disabled = false,
  isOpen = false,
  icon = ChevronDown,
  accessibilityLabel,
  style,
  onPress,
}: SelectStyleInputProps) {
  const { theme } = useAzdTheme()
  const [isPressed, setIsPressed] = useState(false)
  const hasValue = display != null && display.length > 0

  const resolvedState = useMemo((): SelectState => ({
    isDisabled: disabled,
    isOpen,
    hasValue,
    isPressed,
  }), [disabled, hasValue, isOpen, isPressed])

  const selectTheme = theme.components.select
  const resolvedTriggerStyle = useMemoizedTheme(selectTheme.trigger, resolvedState)
  const resolvedStateLayerStyle = useMemoizedTheme(selectTheme.stateLayer, resolvedState)
  const resolvedTriggerTextStyle = useMemoizedTheme(selectTheme.triggerText, resolvedState)
  const resolvedIcon = useMemoizedTheme<SelectState, IconStyle>(
    selectTheme.icon,
    resolvedState,
  )

  return (
    <ThemedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? display ?? placeholder}
      accessibilityState={{ disabled }}
      style={[resolvedTriggerStyle, { width: "100%" }, style]}
      onPressIn={() => {
        setIsPressed(true)
      }}
      onPressOut={() => {
        setIsPressed(false)
      }}
      onPress={onPress}
    >
      <View pointerEvents="none" style={resolvedStateLayerStyle} />
      <ThemedText style={[resolvedTriggerTextStyle]}>
        {hasValue ? display : placeholder}
      </ThemedText>
      <ThemedIcon
        icon={icon}
        size={resolvedIcon.size}
        strokeWidth={resolvedIcon.strokeWidth}
        color={resolvedIcon.color}
      />
    </ThemedPressable>
  )
}
