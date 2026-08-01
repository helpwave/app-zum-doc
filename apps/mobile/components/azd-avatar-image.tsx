import type { AvatarImageProps } from "@helpwave/hightide-native/components"
import { Image as ExpoImage } from "expo-image"
import { Image } from "react-native"

const practiceLogo = require("../assets/images/practice-logo.png")

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

  if (imageUri === "practice-logo" || imageUri.startsWith("http")) {
    return { avatarUrl: imageUri, alt }
  }

  return undefined
}
