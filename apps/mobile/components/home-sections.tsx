import { DoctorCard } from "@/components/doctor-card"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toShadowStyle } from "@/theme/azd-theme"
import type {
  HomeDoctorCard,
  HomeQuickAction,
  HomeRequest,
  HomeSummary,
} from "@app-zum-doc/utils/api"
import { Button, ThemedPressable } from "@helpwave/hightide-native/components"
import { LinearGradient } from "expo-linear-gradient"
import {
  Calendar,
  ChevronRight,
  FileText,
  Pill,
  Search,
} from "lucide-react-native"
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

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
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.md + theme.spacing.sm,
        paddingBottom: theme.spacing.lg + theme.spacing.sm,
        gap: theme.spacing.xl - theme.spacing.xs,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -120,
          top: 40,
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
      <Text
        style={{
          ...theme.typography.heading.lg,
          fontFamily: "SpaceGrotesk",
          fontWeight: theme.typography.fontWeights.semibold,
          textAlign: "center",
          color: colors.heroTitle,
        }}
      >
        {t("appName")}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("searchDoctor")}
        onPress={onSearchPress}
        style={{
          height: theme.elements.control.md.size - theme.spacing.xs,
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: colors.searchBackground,
          ...toShadowStyle(theme.shadow.dialog),
        }}
      >
        <Search size={theme.icongraphy.sizes.xs} color={colors.searchIcon} />
        <Text
          style={{
            flex: 1,
            ...theme.typography.body.md,
            color: colors.searchPlaceholder,
          }}
        >
          {t("searchDoctor")}
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.md + theme.spacing.sm,
        }}
      >
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
      style={{
        flex: 1,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md + theme.spacing.sm,
        gap: theme.spacing.md + theme.spacing.sm,
        backgroundColor: colors.actionBackground,
        ...toShadowStyle(theme.shadow.popover),
      }}
    >
      <Icon size={theme.icongraphy.sizes.md} color={colors.actionIcon} />
      <Text
        style={{
          ...theme.typography.body.sm,
          fontWeight: theme.typography.fontWeights.semibold,
          color: colors.actionText,
        }}
      >
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          ...theme.typography.heading.sm,
          fontWeight: theme.typography.fontWeights.bold,
          color: colors.sectionTitle,
        }}
      >
        {title}
      </Text>
      <Button
        accessibilityRole="button"
        onPress={onShowAll}
        size="xs"
        color={{color: theme.colors.surface.onColor, onColor: theme.colors.surface.color}}
        trailingIcon={ChevronRight}
        variant="foreground"
      >
          {t("showAll")}
      </Button>
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
  const { theme } = useAzdTheme()

  return (
    <View style={{ gap: theme.spacing.md + theme.spacing.sm }}>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <StartSectionHeader title={t("myDoctors")} onShowAll={onShowAll} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.md + theme.spacing.sm,
        }}
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
  return <DoctorCard doctor={doctor} onPress={onPress} width={306} />
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
  const { theme } = useAzdTheme()

  return (
    <View
      style={{
        gap: theme.spacing.md + theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <StartSectionHeader title={t("recentRequests")} onShowAll={onShowAll} />
      <View style={{ gap: theme.spacing.md + theme.spacing.xs }}>
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
    <ThemedPressable
      accessibilityRole="button"
      onPress={onPress}
      color={theme.colors.surface}
      coloringStyle="filled"
      style={{
        flexDirection: "row",
        borderRadius: theme.borderRadius.lg,
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        gap: theme.spacing.md + theme.spacing.sm,
        alignItems: "flex-start",
        backgroundColor: colors.cardBackground,
        ...toShadowStyle(theme.shadow.container),
      }}
    >
      <View
        style={{
          flex: 1,
          gap: theme.spacing.md,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              ...theme.typography.body.md,
              fontWeight: theme.typography.fontWeights.medium,
              color: colors.requestDoctor,
            }}
          >
            {request.doctorName}
          </Text>
          <Text
            style={{
              ...theme.typography.heading.md,
              color: colors.requestTitle,
            }}
          >
            {request.title}
          </Text>
        </View>
        <View
          style={{
            width: 132,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm + theme.spacing.xs,
            paddingVertical: theme.spacing.md - theme.spacing.xs,
            paddingHorizontal: theme.spacing.md + theme.spacing.sm,
            borderRadius: 9999,
            overflow: "hidden",
            backgroundColor: isWarning
              ? colors.statusWarningBackground
              : colors.statusSuccessBackground,
          }}
        >
          <View
            style={{
              width: theme.spacing.md,
              height: theme.spacing.md,
              borderRadius: 9999,
              flexShrink: 0,
              backgroundColor: isWarning
                ? colors.statusWarningDot
                : colors.statusSuccessDot,
            }}
          />
          <Text
            style={{
              flexShrink: 1,
              ...theme.typography.body.sm,
              fontWeight: theme.typography.fontWeights.medium,
              color: isWarning
                ? colors.statusWarningText
                : colors.statusSuccessText,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {request.statusLabel}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: 132,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md + theme.spacing.sm,
          borderRadius: theme.borderRadius.lg,
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: colors.kindTagBackground,
        }}
      >
        <KindIcon size={15} color={colors.kindTagText} />
        <Text
          style={{
            flexShrink: 1,
            ...theme.typography.body.sm,
            fontWeight: theme.typography.fontWeights.medium,
            color: colors.kindTagText,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {request.kindLabel}
        </Text>
      </View>
    </ThemedPressable>
  )
}
