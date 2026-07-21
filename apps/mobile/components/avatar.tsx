import { Image } from "expo-image"
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native"
import { PresenceDot } from "@/components/presence-dot"
import {
  avatarPaletteForId,
  azd,
  initialsFromName,
} from "@/theme/azd-tokens"

const practiceLogo = require("../assets/images/practice-logo.png")

type AvatarProps = {
  id: string
  name: string
  initials?: string
  imageUri?: string | null
  size?: number
  presence?: "online" | "offline" | null
  style?: StyleProp<ViewStyle>
}

export function Avatar({
  id,
  name,
  initials,
  imageUri,
  size = 52,
  presence = null,
  style,
}: AvatarProps) {
  const palette = avatarPaletteForId(id)
  const label = initials ?? initialsFromName(name)
  const fontSize = size >= 48 ? 18 : 15
  const showImage = imageUri === "practice-logo" || (imageUri?.startsWith("http") ?? false)

  return (
    <View style={[{ width: size, height: size }, style]}>
      {showImage ? (
        <Image
          source={imageUri === "practice-logo" ? practiceLogo : { uri: imageUri! }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: azd.green[100],
          }}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: palette.background,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: azd.font.display,
              fontWeight: "700",
              fontSize,
              color: palette.foreground,
            }}
          >
            {label}
          </Text>
        </View>
      )}
      {presence ? (
        <PresenceDot
          online={presence === "online"}
          size={size >= 48 ? 14 : 12}
          ringWidth={size >= 48 ? 3 : 2.5}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
})
