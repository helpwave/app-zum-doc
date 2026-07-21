import { Chip } from "@helpwave/hightide-native/components"
import { Pressable } from "react-native"
import { azd } from "@/theme/azd-tokens"

type QuickReplyChipProps = {
  label: string
  active?: boolean
  onPress?: () => void
}

export function QuickReplyChip({
  label,
  active = false,
  onPress,
}: QuickReplyChipProps) {
  return (
    <Pressable onPress={onPress}>
      <Chip
        color="primary"
        coloringStyle="outline"
        size="sm"
        chipStyle={() => ({
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: active ? azd.green[600] : azd.divider,
          borderRadius: azd.radius.pill,
          paddingHorizontal: 14,
          paddingVertical: 8,
        })}
        textStyle={() => ({
          fontFamily: azd.font.display,
          fontWeight: "500",
          fontSize: 13,
          color: active ? azd.green[600] : azd.fg[4],
        })}
      >
        {label}
      </Chip>
    </Pressable>
  )
}
