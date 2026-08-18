import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toShadowStyle } from "@/theme/azd-theme"
import type { HomeDoctorCard } from "@app-zum-doc/utils/api"
import { ThemedPressable } from "@helpwave/hightide-native/components"
import { Image, ImageStyle } from "expo-image"
import { Phone } from "lucide-react-native"
import { Text, View, ViewStyle, type DimensionValue } from "react-native"

const doctorPortrait = require("../assets/images/doctor-portrait.png")
const practiceLogo = require("../assets/images/practice-logo.png")

type DoctorCardProps = {
  doctor: HomeDoctorCard
  onPress: () => void
  width?: DimensionValue
}

export function DoctorCard({ doctor, onPress, width = 306 }: DoctorCardProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const imageSource =
    doctor.imageUri === "practice-logo"
      ? practiceLogo
      : doctor.imageUri === "doctor-portrait"
        ? doctorPortrait
        : null
  const photoStyle: ViewStyle & ImageStyle = {
    width: theme.elements.container.md.size * 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: "stretch"
  }

  return (
    <ThemedPressable
      accessibilityRole="button"
      onPress={onPress}
      color={theme.colors.surface}
      coloringStyle="filled"
      style={{
        width,
        height: 155,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignContent: "stretch",
        gap: theme.spacing.md + theme.spacing.xs,
        padding: theme.spacing.md + theme.spacing.xs,
        backgroundColor: colors.cardBackground,
        ...toShadowStyle(theme.shadow.container),
      }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={photoStyle}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            ...photoStyle,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.avatarBackground,
          }}
        >
          <Text
            style={{
              ...theme.typography.heading.lg,
              fontWeight: theme.typography.fontWeights.semibold,
              color: colors.avatarText,
            }}
          >
            {doctor.initials ?? doctor.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingVertical: theme.spacing.md,
          alignSelf: "stretch",
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              ...theme.typography.heading.md,
              color: colors.doctorName,
            }}
          >
            {doctor.name}
          </Text>
          <Text
            style={{
              ...theme.typography.body.sm,
              color: colors.doctorSpecialty,
            }}
            numberOfLines={2}
          >
            {doctor.specialty}
          </Text>
        </View>
        <View style={{ gap: theme.spacing.md + theme.spacing.xs }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                width: 12,
                height: theme.icongraphy.sizes.xs,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  backgroundColor: doctor.isOpen
                    ? colors.openDot
                    : colors.closedDot,
                }}
              />
            </View>
            <Text
              style={{
                flex: 1,
                ...theme.typography.body.sm,
                lineHeight: theme.icongraphy.sizes.xs,
                includeFontPadding: false,
                textAlignVertical: "center",
                color: colors.doctorMeta,
              }}
              numberOfLines={1}
            >
              {doctor.openStatusLabel}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                width: 12,
                height: theme.icongraphy.sizes.xs,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Phone size={12} color={colors.doctorName} fill={colors.doctorName} />
            </View>
            <Text
              style={{
                flex: 1,
                ...theme.typography.body.sm,
                lineHeight: theme.icongraphy.sizes.xs,
                includeFontPadding: false,
                textAlignVertical: "center",
                color: colors.doctorMeta,
              }}
              numberOfLines={1}
            >
              {doctor.phone}
            </Text>
          </View>
        </View>
      </View>
    </ThemedPressable>
  )
}
