import { StyleSheet, View } from "react-native"
import { azd } from "@/theme/azd-tokens"

type PresenceDotProps = {
  online: boolean
  size?: number
  ringColor?: string
  ringWidth?: number
}

export function PresenceDot({
  online,
  size = 14,
  ringColor = "#FFFFFF",
  ringWidth = 3,
}: PresenceDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: online ? azd.green[600] : azd.fg[7],
          borderWidth: ringWidth,
          borderColor: ringColor,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    right: 1,
    bottom: 1,
  },
})
