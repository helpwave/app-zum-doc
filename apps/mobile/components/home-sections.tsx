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
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
import { Button, ThemedIcon, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { ContentThemeOverrideProvider } from "@helpwave/hightide-native/global-contexts"
import { LinearGradient } from "expo-linear-gradient"
import {
  Calendar,
  ChevronRight,
  FileText,
  Pill,
  Search,
} from "lucide-react-native"
import {
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
      colors={[
        OKLCHUtils.changeLightness(theme.colors.primary.color, 0.4), 
        OKLCHUtils.changeLightness(theme.colors.primary.color, 0.6)
      ]}
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

      <ThemedPressable
        accessibilityRole="button"
        accessibilityLabel={t("searchDoctor")}
        onPress={onSearchPress}
        color={theme.colors.surface}
        coloringStyle="filled"
        stateLayerStyle={{
          borderRadius: 999,
        }}
        style={{
          height: theme.elements.control.md.size - theme.spacing.xs,
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.lg,
          ...toShadowStyle(theme.shadow.dialog),
        }}
      >
        <Search 
          size={theme.icongraphy.sizes.xs} 
          color={theme.semantics.withAppearance({color: theme.colors.surface.onColor, appearance: "subtle"})}
        />
        <Text
          style={{
            flex: 1,
            ...theme.typography.body.md,
            color: theme.semantics.asDescription({color: theme.colors.surface.onColor}),
          }}
        >
          {t("searchDoctor")}
        </Text>
      </ThemedPressable>

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
  const color = theme.colors[action.id]
  const Icon = quickActionIcons[action.id]

  return (
    <ThemedPressable
      accessibilityRole="button"
      onPress={onPress}
      // TODO fix typing
      color={{color: theme.colors.surface.color, onColor: color.color}}
      coloringStyle="filled"
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        borderBottomLeftRadius: theme.borderRadius.lg,
        borderBottomRightRadius: theme.borderRadius.lg,
        paddingTop: theme.spacing.md + theme.spacing.sm,
        paddingRight: theme.spacing.md + theme.spacing.sm,
        paddingBottom: theme.spacing.md + theme.spacing.sm,
        paddingLeft: theme.spacing.md + theme.spacing.sm,
        gap: theme.spacing.lg,
        ...toShadowStyle(theme.shadow.popover),
      }}
    >
      <ThemedIcon size={theme.icongraphy.sizes.md} icon={Icon}/>
      <ThemedText
        style={{
          ...theme.typography.body.sm,
          fontWeight: theme.typography.fontWeights.semibold,
        }}
      >
        {action.label}
      </ThemedText>
    </ThemedPressable>
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
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
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
          maxWidth: theme.elements.container.md.size * 3,
          flexDirection: "row",
          alignItems: "center",
          alignContent: "center",
          alignSelf: "flex-start",
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md + theme.spacing.sm,
          borderRadius: theme.borderRadius.lg,
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: theme.colors[request.kind].color,
        }}
      >
        <ContentThemeOverrideProvider foreground={theme.colors[request.kind].onColor}>
          <ThemedIcon size={theme.icongraphy.sizes.xs} icon={KindIcon} />
          <ThemedText
            style={{
              flexShrink: 1,
              ...theme.typography.body.sm,
              fontWeight: theme.typography.fontWeights.medium,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {request.kindLabel}
          </ThemedText>
        </ContentThemeOverrideProvider>
      </View>
    </ThemedPressable>
  )
}
