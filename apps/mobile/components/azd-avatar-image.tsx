import type { AvatarImageProps } from "@helpwave/hightide-native/components"
import { Image as ExpoImage } from "expo-image"
import { Image } from "react-native"

const practiceLogo = require("../assets/images/practice-logo.png")
const doctorPortrait = require("../assets/images/doctor-portrait.png")

export function AzdAvatarImage({
  source,
  alt,
  style,
  onLoad,
  onError,
}: AvatarImageProps) {
  if (source.uri === "practice-logo") {
    return (
      <ExpoImage
        source={practiceLogo}
        style={style}
        contentFit="cover"
        accessibilityLabel={alt}
        onLoad={() => onLoad?.({} as never)}
      />
    )
  }

  if (source.uri === "doctor-portrait") {
    return (
      <ExpoImage
        source={doctorPortrait}
        style={style}
        contentFit="cover"
        accessibilityLabel={alt}
        onLoad={() => onLoad?.({} as never)}
      />
    )
  }

  return (
    <Image
      source={source}
      accessibilityLabel={alt}
      style={style}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

export function contactAvatarImage(
  imageUri: string | null | undefined,
  alt: string,
) {
  if (!imageUri) {
    return undefined
  }

  if (imageUri === "practice-logo" || imageUri === "doctor-portrait" || imageUri.startsWith("http")) {
    return { avatarUrl: imageUri, alt }
  }

  return undefined
}
