import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  doctorsOfficeStatusFromOpeningHours,
  type DoctorsOffice,
} from "@app-zum-doc/utils/api"
import { Avatar, ThemedPressable } from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Phone } from "lucide-react-native"
import { Text, View, ViewStyle } from "react-native"

type DoctorCardProps = {
  doctor: DoctorsOffice
  onPress: () => void,
  style?: ViewStyle,
}

export function DoctorCard({ doctor, onPress, style }: DoctorCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const avatarSize = theme.semantics.container.md.size * 2
  const status = doctorsOfficeStatusFromOpeningHours(doctor.openingHours)

  return (
    <ThemedPressable
      accessibilityRole="button"
      onPress={onPress}
      color={theme.colors.surface}
      coloringStyle="filled"
      style={{
        height: theme.semantics.container.md.size * 3,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignContent: "stretch",
        alignSelf: "stretch",
        gap: theme.spacing.md,
        padding: theme.padding.xl,
        paddingInlineEnd: theme.padding.xl + theme.spacing.md,
        backgroundColor: colors.cardBackground,
        boxShadow: StyleAdapterUtils.shadow(theme.shadow.container),
        ...style,
      }}
    >
      <Avatar
        name={doctor.name}
        image={contactAvatarImage(doctor.imageUri, doctor.name)}
        ImageComponent={AzdAvatarImage}
        size={avatarSize}
        style={{ alignSelf: "stretch" }}
        avatarStyle={{ borderRadius: theme.borderRadius.md }}
        imageStyle={{ borderRadius: theme.borderRadius.md }}
      />
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
            {doctor.specialization}
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
                  backgroundColor: status === "open"
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
              {t("officeStatus", { status })}
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
              {doctor.phoneNumber}
            </Text>
          </View>
        </View>
      </View>
    </ThemedPressable>
  )
}
