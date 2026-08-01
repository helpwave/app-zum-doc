import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import type {
  HomeDoctorCard,
  HomeQuickAction,
  HomeRequest,
  HomeSummary,
} from "@app-zum-doc/utils/api"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import {
  Calendar,
  ChevronRight,
  FileText,
  Phone,
  Pill,
  Search,
} from "lucide-react-native"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../assets/images/doctor-portrait.png")

type StartHeroProps = {
  onSearchPress: () => void
  quickActions: HomeSummary["quickActions"]
  onQuickActionPress: (action: HomeQuickAction) => void
}

export function StartHero({
  onSearchPress,
  quickActions,
  onQuickActionPress,
}: StartHeroProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const insets = useSafeAreaInsets()

  return (
    <LinearGradient
      colors={[colors.heroStart, colors.heroEnd]}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + azdLayout.space[3] }]}
    >
      <View style={styles.heroDecor} pointerEvents="none" />
      <Text style={[styles.heroTitle, { color: colors.heroTitle }]}>
        {t("appName")}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("searchDoctor")}
        onPress={onSearchPress}
        style={[
          styles.searchField,
          {
            backgroundColor: colors.searchBackground,
            ...azdLayout.shadow.hero,
          },
        ]}
      >
        <Search size={16} color={colors.searchIcon} />
        <Text style={[styles.searchPlaceholder, { color: colors.searchPlaceholder }]}>
          {t("searchDoctor")}
        </Text>
      </Pressable>

      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <StartQuickActionCard
            key={action.id}
            action={action}
            onPress={() => onQuickActionPress(action)}
          />
        ))}
      </View>
    </LinearGradient>
  )
}

type StartQuickActionCardProps = {
  action: HomeQuickAction
  onPress: () => void
}

const quickActionIcons = {
  prescription: Pill,
  appointment: Calendar,
  referral: FileText,
} as const

function StartQuickActionCard({
  action,
  onPress,
}: StartQuickActionCardProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const Icon = quickActionIcons[action.id]

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          backgroundColor: colors.actionBackground,
          ...azdLayout.shadow.lift,
        },
      ]}
    >
      <Icon size={24} color={colors.actionIcon} />
      <Text style={[styles.quickActionLabel, { color: colors.actionText }]}>
        {action.label}
      </Text>
    </Pressable>
  )
}

type SectionHeaderProps = {
  title: string
  onShowAll: () => void
}

export function StartSectionHeader({ title, onShowAll }: SectionHeaderProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onShowAll}
        style={styles.showAllRow}
      >
        <Text style={[styles.showAll, { color: colors.showAll }]}>
          {t("showAll")}
        </Text>
        <View style={styles.showAllIconWrap}>
          <ChevronRight size={12} color={colors.showAll} strokeWidth={2.4} />
        </View>
      </Pressable>
    </View>
  )
}

type MyDoctorsSectionProps = {
  doctors: HomeDoctorCard[]
  onShowAll: () => void
  onDoctorPress: (doctorId: string) => void
}

export function MyDoctorsSection({
  doctors,
  onShowAll,
  onDoctorPress,
}: MyDoctorsSectionProps) {
  const t = useAppTranslation()

  return (
    <View style={styles.section}>
      <View style={styles.sectionPadding}>
        <StartSectionHeader title={t("myDoctors")} onShowAll={onShowAll} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.doctorsScroll}
      >
        {doctors.map((doctor) => (
          <StartDoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={() => onDoctorPress(doctor.id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

type StartDoctorCardProps = {
  doctor: HomeDoctorCard
  onPress: () => void
}

export function StartDoctorCard({ doctor, onPress }: StartDoctorCardProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const hasPortrait = doctor.imageUri === "doctor-portrait"

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.doctorCard,
        {
          backgroundColor: colors.cardBackground,
          ...azdLayout.shadow.pop,
        },
      ]}
    >
      {hasPortrait ? (
        <Image
          source={doctorPortrait}
          style={styles.doctorPhoto}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.doctorPhoto,
            styles.doctorInitials,
            { backgroundColor: colors.avatarBackground },
          ]}
        >
          <Text style={[styles.doctorInitialsText, { color: colors.avatarText }]}>
            {doctor.initials ?? doctor.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.doctorBody}>
        <View style={styles.doctorTop}>
          <Text style={[styles.doctorName, { color: colors.doctorName }]}>
            {doctor.name}
          </Text>
          <Text
            style={[styles.doctorSpecialty, { color: colors.doctorSpecialty }]}
            numberOfLines={2}
          >
            {doctor.specialty}
          </Text>
        </View>
        <View style={styles.doctorBottom}>
          <View style={styles.doctorMetaRow}>
            <View style={styles.doctorMetaIconWrap}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: doctor.isOpen
                      ? colors.openDot
                      : colors.closedDot,
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.doctorMeta, { color: colors.doctorMeta }]}
              numberOfLines={1}
            >
              {doctor.openStatusLabel}
            </Text>
          </View>
          <View style={styles.doctorMetaRow}>
            <View style={styles.doctorMetaIconWrap}>
              <Phone size={12} color={colors.doctorName} fill={colors.doctorName} />
            </View>
            <Text
              style={[styles.doctorMeta, { color: colors.doctorMeta }]}
              numberOfLines={1}
            >
              {doctor.phone}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

type RecentRequestsSectionProps = {
  requests: HomeRequest[]
  onShowAll: () => void
  onRequestPress: (requestId: string) => void
}

export function RecentRequestsSection({
  requests,
  onShowAll,
  onRequestPress,
}: RecentRequestsSectionProps) {
  const t = useAppTranslation()

  return (
    <View style={[styles.section, styles.sectionPadding]}>
      <StartSectionHeader title={t("recentRequests")} onShowAll={onShowAll} />
      <View style={styles.requestsList}>
        {requests.map((request) => (
          <RequestTile
            key={request.id}
            request={request}
            onPress={() => onRequestPress(request.id)}
          />
        ))}
      </View>
    </View>
  )
}

type RequestTileProps = {
  request: HomeRequest
  onPress: () => void
}

export function RequestTile({ request, onPress }: RequestTileProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const isWarning = request.status === "in_progress"
  const KindIcon =
    request.kind === "prescription"
      ? Pill
      : request.kind === "appointment"
        ? Calendar
        : FileText

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.requestTile,
        {
          backgroundColor: colors.cardBackground,
          ...azdLayout.shadow.pop,
        },
      ]}
    >
      <View style={styles.requestBody}>
        <View style={styles.requestText}>
          <Text style={[styles.requestDoctor, { color: colors.requestDoctor }]}>
            {request.doctorName}
          </Text>
          <Text style={[styles.requestTitle, { color: colors.requestTitle }]}>
            {request.title}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isWarning
                ? colors.statusWarningBackground
                : colors.statusSuccessBackground,
            },
          ]}
        >
          <View
            style={[
              styles.statusBadgeDot,
              {
                backgroundColor: isWarning
                  ? colors.statusWarningDot
                  : colors.statusSuccessDot,
              },
            ]}
          />
          <Text
            style={[
              styles.statusBadgeLabel,
              {
                color: isWarning
                  ? colors.statusWarningText
                  : colors.statusSuccessText,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {request.statusLabel}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.kindTag,
          { backgroundColor: colors.kindTagBackground },
        ]}
      >
        <KindIcon size={15} color={colors.kindTagText} />
        <Text
          style={[styles.kindTagLabel, { color: colors.kindTagText }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {request.kindLabel}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: azdLayout.space[4],
    paddingBottom: azdLayout.space[5],
    gap: 22,
    overflow: "hidden",
  },
  heroDecor: {
    position: "absolute",
    left: -120,
    top: 40,
    width: 340,
    height: 340,
    borderRadius: 9999,
    borderWidth: 22,
    borderColor: "rgba(245,245,245,0.12)",
  },
  heroTitle: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 24,
    textAlign: "center",
    letterSpacing: -0.43,
  },
  searchField: {
    height: 46,
    borderRadius: azdLayout.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: azdLayout.space[2],
    paddingHorizontal: azdLayout.space[4],
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontSize: 15,
  },
  quickActions: {
    flexDirection: "row",
    gap: azdLayout.space[3],
  },
  quickAction: {
    flex: 1,
    borderRadius: azdLayout.radius.md,
    padding: azdLayout.space[3],
    gap: azdLayout.space[3],
  },
  quickActionLabel: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    gap: azdLayout.space[3],
  },
  sectionPadding: {
    paddingHorizontal: azdLayout.space[4],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: azdLayout.font.display,
    fontWeight: "700",
    fontSize: 16,
  },
  showAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  showAll: {
    fontFamily: azdLayout.font.display,
    fontSize: 14,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  showAllIconWrap: {
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  doctorsScroll: {
    paddingHorizontal: azdLayout.space[4],
    paddingVertical: azdLayout.space[2],
    gap: azdLayout.space[3],
  },
  doctorCard: {
    width: 306,
    height: 155,
    borderRadius: azdLayout.radius.sm,
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  doctorPhoto: {
    width: 97,
    borderRadius: 7,
  },
  doctorInitials: {
    alignItems: "center",
    justifyContent: "center",
  },
  doctorInitialsText: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 28,
  },
  doctorBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: azdLayout.space[2],
  },
  doctorTop: {
    gap: 2,
  },
  doctorName: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: -0.43,
  },
  doctorSpecialty: {
    fontFamily: azdLayout.font.display,
    fontSize: 13,
  },
  doctorBottom: {
    gap: 10,
  },
  doctorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doctorMetaIconWrap: {
    width: 12,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  doctorMeta: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  requestsList: {
    gap: 10,
  },
  requestTile: {
    borderRadius: azdLayout.radius.md,
    padding: azdLayout.space[4],
    flexDirection: "row",
    gap: azdLayout.space[3],
    alignItems: "flex-start",
  },
  requestBody: {
    flex: 1,
    gap: azdLayout.space[2],
  },
  requestText: {
    gap: 2,
  },
  requestDoctor: {
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 16,
    letterSpacing: -0.43,
  },
  requestTitle: {
    fontFamily: azdLayout.font.display,
    fontWeight: "600",
    fontSize: 17,
    letterSpacing: -0.43,
  },
  statusBadge: {
    width: 132,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: azdLayout.radius.pill,
    overflow: "hidden",
  },
  statusBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    flexShrink: 0,
  },
  statusBadgeLabel: {
    flexShrink: 1,
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 13,
  },
  kindTag: {
    width: 132,
    flexDirection: "row",
    alignItems: "center",
    gap: azdLayout.space[2],
    paddingVertical: azdLayout.space[2],
    paddingHorizontal: azdLayout.space[3],
    borderRadius: azdLayout.radius.md,
    overflow: "hidden",
    flexShrink: 0,
  },
  kindTagLabel: {
    flexShrink: 1,
    fontFamily: azdLayout.font.display,
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: -0.43,
  },
})
