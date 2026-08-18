import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { toShadowStyle } from "@/theme/azd-theme"
import type { DoctorsOffice } from "@app-zum-doc/utils/api"
import { Card, ListItem } from "@helpwave/hightide-native/components"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import {
  ChevronLeft,
  Ellipsis,
  Phone,
  Plus
} from "lucide-react-native"
import {
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Section } from "./section"

const doctorPortrait = require("../assets/images/doctor-portrait.png")

type DoctorDetailHeroProps = {
  office: DoctorsOffice
  onBack: () => void
  onMore: () => void
  onAddDoctor: () => void
  onCall: () => void
}

export function DoctorDetailHero({
  office,
  onBack,
  onMore,
  onAddDoctor,
  onCall,
}: DoctorDetailHeroProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const insets = useSafeAreaInsets()

  return (
    <LinearGradient
      colors={[colors.heroStart, colors.heroEnd]}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.md + theme.spacing.sm,
        paddingBottom: theme.spacing.lg + theme.spacing.sm,
        gap: theme.spacing.lg,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -120,
          top: 60,
          width: 340,
          height: 340,
          borderRadius: 9999,
          borderWidth: theme.spacing.xl - theme.spacing.xs,
          borderColor: theme.semantics.withAppearance({
            color: "#F5F5F5",
            appearance: "faded",
          }),
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityLabel={t("back")}
          accessibilityRole="button"
          hitSlop={theme.spacing.md}
          onPress={onBack}
        >
          <ChevronLeft size={theme.icongraphy.sizes.md} color={colors.heroIcon} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityLabel={t("moreOptions")}
          accessibilityRole="button"
          hitSlop={theme.spacing.md}
          onPress={onMore}
        >
          <Ellipsis size={theme.icongraphy.sizes.sm} color={colors.heroIcon} />
        </Pressable>
      </View>

      <DoctorSummaryCard office={office} onCall={onCall} />

      <Pressable
        accessibilityRole="button"
        onPress={onAddDoctor}
        style={{
          height: theme.elements.control.md.size,
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.md,
          backgroundColor: colors.ctaBackground,
        }}
      >
        <Plus size={theme.icongraphy.sizes.sm} color={colors.ctaText} strokeWidth={2.2} />
        <Text
          style={{
            ...theme.typography.body.md,
            fontWeight: theme.typography.fontWeights.medium,
            color: colors.ctaText,
          }}
        >
          {t("addAsMyDoctor")}
        </Text>
      </Pressable>
    </LinearGradient>
  )
}

type DoctorSummaryCardProps = {
  office: DoctorsOffice
  onCall: () => void
}

export function DoctorSummaryCard({
  office,
  onCall,
}: DoctorSummaryCardProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const imageSource =
    office.imageUri === "doctor-portrait"
      ? doctorPortrait
      : office.imageUri
        ? { uri: office.imageUri }
        : doctorPortrait

  return (
    <View
      style={{
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        gap: theme.spacing.md + theme.spacing.xs,
        padding: theme.spacing.md + theme.spacing.xs,
        height: 137,
        backgroundColor: colors.cardBackground,
        ...toShadowStyle(theme.shadow.container),
      }}
    >
      <Image
        source={imageSource}
        style={{
          width: 97,
          flexGrow: 0,
          flexShrink: 0,
          borderRadius: theme.borderRadius.md,
          borderWidth: theme.border.thin,
          borderColor: colors.cardBorder,
        }}
        contentFit="cover"
      />
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingVertical: theme.spacing.md,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              ...theme.typography.heading.md,
              color: colors.name,
            }}
          >
            {office.name}
          </Text>
          <Text
            style={{
              ...theme.typography.body.sm,
              color: colors.specialty,
            }}
          >
            {office.specialty}
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
                height: 12,
                borderRadius: 9999,
                backgroundColor: office.isOpen
                  ? colors.openDot
                  : colors.closedDot,
              }}
            />
            <Text
              style={{
                ...theme.typography.body.sm,
                color: colors.specialty,
              }}
            >
              {office.openStatusLabel}
            </Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={onCall}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <Phone size={12} color={colors.phoneText} fill={colors.phoneText} />
            <Text
              style={{
                ...theme.typography.body.sm,
                color: colors.specialty,
              }}
            >
              {office.phone}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

type OpeningHoursSectionProps = {
  openingHours: DoctorsOffice["openingHours"]
}

export function OpeningHoursSection({
  openingHours,
}: OpeningHoursSectionProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail

  return (
    <Section title={t("openingHours")}>
      <Card>
        {openingHours.map((period, index) => {
          const isLast = index === openingHours.length - 1
          const isClosed = period.times.length === 0

          return (
            <ListItem
              key={period.dayLabel}
              style={[
                !isLast && {
                  borderBottomWidth: theme.border.thin,
                  borderBottomColor: colors.rowDivider,
                },
              ]}
              title={period.dayLabel}
              trailing={isClosed ? (
                <Text
                  style={{
                    ...theme.typography.body.md,
                    color: colors.rowMuted,
                  }}
                >
                  {t("closed")}
                </Text>
              ) : (
                <View
                  style={{
                    alignItems: "flex-end",
                    gap: theme.spacing.md,
                  }}
                >
                  {period.times.map((time) => (
                    <Text
                      key={time}
                      style={{
                        ...theme.typography.body.md,
                        color: colors.rowValue,
                      }}
                    >
                      {time}
                    </Text>
                  ))}
                </View>
              )}
            />
          )
        })}
      </Card>
    </Section>
  )
}

export function openDoctorsOfficePhone(phone: string): void {
  const digits = phone.replace(/[^\d+]/g, "")
  void Linking.openURL(`tel:${digits}`)
}

export function openDoctorsOfficeWebsite(url: string): void {
  void Linking.openURL(url)
}

export function openDoctorsOfficeNavigation(
  addressLine1: string,
  addressLine2: string,
): void {
  const address = `${addressLine1}, ${addressLine2}`
  const query = encodeURIComponent(address)
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${query}`
      : Platform.OS === "android"
        ? `geo:0,0?q=${query}`
        : `https://www.google.com/maps/dir/?api=1&destination=${query}`

  void Linking.openURL(url)
}
