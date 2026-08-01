import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import type { DoctorsOffice } from "@app-zum-doc/utils/api"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Phone,
  Plus,
} from "lucide-react-native"
import type { ReactNode } from "react"
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

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
      style={[styles.hero, { paddingTop: insets.top + azdLayout.space[3] }]}
    >
      <View style={styles.heroDecor} pointerEvents="none" />
      <View style={styles.heroNav}>
        <Pressable
          accessibilityLabel={t("back")}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={colors.heroIcon} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityLabel={t("moreOptions")}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onMore}
        >
          <Ellipsis size={22} color={colors.heroIcon} />
        </Pressable>
      </View>

      <DoctorSummaryCard office={office} onCall={onCall} />

      <Pressable
        accessibilityRole="button"
        onPress={onAddDoctor}
        style={[
          styles.addButton,
          { backgroundColor: colors.ctaBackground },
        ]}
      >
        <Plus size={18} color={colors.ctaText} strokeWidth={2.2} />
        <Text style={[styles.addButtonLabel, { color: colors.ctaText }]}>
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
      style={[
        styles.summaryCard,
        {
          backgroundColor: colors.cardBackground,
          ...azdLayout.shadow.pop,
        },
      ]}
    >
      <Image
        source={imageSource}
        style={[styles.portrait, { borderColor: colors.cardBorder }]}
        contentFit="cover"
      />
      <View style={styles.summaryBody}>
        <View style={styles.summaryTop}>
          <Text style={[styles.name, { color: colors.name }]}>
            {office.name}
          </Text>
          <Text style={[styles.specialty, { color: colors.specialty }]}>
            {office.specialty}
          </Text>
        </View>
        <View style={styles.summaryBottom}>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: office.isOpen
                    ? colors.openDot
                    : colors.closedDot,
                },
              ]}
            />
            <Text style={[styles.metaText, { color: colors.specialty }]}>
              {office.openStatusLabel}
            </Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={onCall}
            style={styles.metaRow}
          >
            <Phone size={12} color={colors.phoneText} fill={colors.phoneText} />
            <Text style={[styles.metaText, { color: colors.specialty }]}>
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
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
        {t("openingHours")}
      </Text>
      <View
        style={[
          styles.hoursCard,
          {
            backgroundColor: colors.rowBackground,
            ...azdLayout.shadow.pop,
          },
        ]}
      >
        {openingHours.map((period, index) => {
          const isLast = index === openingHours.length - 1
          const isClosed = period.times.length === 0

          return (
            <View
              key={period.dayLabel}
              style={[
                styles.hoursRow,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.rowDivider,
                },
              ]}
            >
              <Text style={[styles.hoursDay, { color: colors.rowLabel }]}>
                {period.dayLabel}
              </Text>
              {isClosed ? (
                <Text style={[styles.hoursTime, { color: colors.rowMuted }]}>
                  {t("closed")}
                </Text>
              ) : (
                <View style={styles.hoursTimes}>
                  {period.times.map((time) => (
                    <Text
                      key={time}
                      style={[styles.hoursTime, { color: colors.rowValue }]}
                    >
                      {time}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

type DoctorInfoRowProps = {
  label: string
  value?: string
  onPress?: () => void
  children?: ReactNode
}

export function DoctorInfoRow({
  label,
  value,
  onPress,
  children,
}: DoctorInfoRowProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const content = (
    <View
      style={[
        styles.infoRow,
        {
          backgroundColor: colors.rowBackground,
          ...azdLayout.shadow.pop,
        },
      ]}
    >
      {children ?? (
        <Text style={[styles.infoRowLabel, { color: colors.rowLabel }]}>
          {value ?? label}
        </Text>
      )}
      {onPress ? (
        <ChevronRight size={15} color={colors.chevron} strokeWidth={2.2} />
      ) : null}
    </View>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  )
}

type DoctorLabeledSectionProps = {
  label: string
  children: ReactNode
}

export function DoctorLabeledSection({
  label,
  children,
}: DoctorLabeledSectionProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
        {label}
      </Text>
      {children}
    </View>
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

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: azdLayout.space[4],
    paddingBottom: azdLayout.space[5],
    gap: azdLayout.space[4],
    overflow: "hidden",
  },
  heroDecor: {
    position: "absolute",
    left: -120,
    top: 60,
    width: 340,
    height: 340,
    borderRadius: 9999,
    borderWidth: 22,
    borderColor: "rgba(245,245,245,0.12)",
  },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryCard: {
    borderRadius: azdLayout.radius.sm,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    height: 137,
  },
  portrait: {
    width: 97,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: azdLayout.space[2],
  },
  summaryTop: {
    gap: 2,
  },
  name: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: -0.43,
  },
  specialty: {
    fontFamily: azdLayout.font.display,
    fontSize: 13,
  },
  summaryBottom: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  metaText: {
    fontFamily: azdLayout.font.display,
    fontSize: 13,
  },
  addButton: {
    height: 48,
    borderRadius: azdLayout.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: azdLayout.space[2],
  },
  addButtonLabel: {
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 16,
  },
  section: {
    gap: azdLayout.space[2],
  },
  sectionLabel: {
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 16,
  },
  hoursCard: {
    borderRadius: azdLayout.radius.sm,
    paddingVertical: azdLayout.space[2],
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: azdLayout.space[3],
    paddingHorizontal: 18,
  },
  hoursDay: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 15,
  },
  hoursTimes: {
    alignItems: "flex-end",
    gap: azdLayout.space[2],
  },
  hoursTime: {
    fontFamily: azdLayout.font.display,
    fontSize: 15,
  },
  infoRow: {
    borderRadius: azdLayout.radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: azdLayout.space[4],
    paddingHorizontal: 18,
  },
  infoRowLabel: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 21,
  },
})
