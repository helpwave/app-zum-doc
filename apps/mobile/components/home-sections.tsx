import { DoctorCard } from "@/components/doctor-card"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  homeQuickActions,
  quickActionTranslationKeys,
} from "@/lib/quick-actions"
import type {
  HomeDoctorCard,
  HomeRequest,
  PatientRequestType,
} from "@app-zum-doc/utils/api"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
import { Chip, ThemedIcon, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { LinearGradient } from "expo-linear-gradient"
import {
  Calendar,
  FileText,
  Pill,
  Search,
} from "lucide-react-native"
import {
  Text,
  useWindowDimensions,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type StartHeroProps = {
  onSearchPress: () => void
  onQuickActionPress: (actionId: PatientRequestType) => void
}

export function StartHero({
  onSearchPress,
  onQuickActionPress,
}: StartHeroProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
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
      <ThemedText
        style={{
          ...theme.typography.heading.lg,
          fontFamily: theme.fontFamilies.accent,
          fontWeight: theme.fontWeights.semibold,
          textAlign: "center",
          color: theme.colors.primary.onColor,
        }}
      >
        {t("appName")}
      </ThemedText>
      

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
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
          ...StyleAdapterUtils.padding({
            type: "logicalAxis",
            inline: theme.spacing.lg,
          }),
          boxShadow: StyleAdapterUtils.shadow(theme.shadow.dialog),
        }}
      >
        <Search 
          size={theme.icongraphy.sizes.xs} 
          color={theme.semantics.withAppearance({colorPair: theme.colors.surface, appearance: "subtle"})}
        />
        <Text
          style={{
            flex: 1,
            ...theme.typography.body.md,
            color: theme.semantics.asDescription({colorPair: theme.colors.surface}),
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
        {homeQuickActions.map((action) => (
          <StartQuickActionCard
            key={action.id}
            actionId={action.id}
            onPress={() => onQuickActionPress(action.id)}
          />
        ))}
      </View>
    </LinearGradient>
  )
}

type StartQuickActionCardProps = {
  actionId: PatientRequestType
  onPress: () => void
}

const quickActionIcons = {
  prescription: Pill,
  appointment: Calendar,
  referral: FileText,
} as const

export function StartQuickActionCard({
  actionId,
  onPress,
}: StartQuickActionCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const color = theme.colors[actionId]
  const Icon = quickActionIcons[actionId]

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
        boxShadow: StyleAdapterUtils.shadow(theme.shadow.popover),
      }}
    >
      <ThemedIcon size={theme.icongraphy.sizes.md} icon={Icon}/>
      <ThemedText
        style={{
          ...theme.typography.body.sm,
          fontWeight: theme.fontWeights.semibold,
        }}
      >
        {t(quickActionTranslationKeys[actionId])}
      </ThemedText>
    </ThemedPressable>
  )
}

type StartDoctorCardProps = {
  doctor: HomeDoctorCard
  onPress: () => void
}

export function StartDoctorCard({ doctor, onPress }: StartDoctorCardProps) {
  const {theme} = useAzdTheme()
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth * 0.8, theme.semantics.container.md.size * 6)

  return <DoctorCard doctor={doctor} onPress={onPress} style={{ width}} />
}

type RequestTileProps = {
  request: HomeRequest
  onPress: () => void
}

export function RequestTile({ request, onPress }: RequestTileProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const isWarning = request.status === "inProgress"
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
        boxShadow: StyleAdapterUtils.shadow(theme.shadow.container),
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
              fontWeight: theme.fontWeights.medium,
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
              fontWeight: theme.fontWeights.medium,
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
      <Chip
        style={{
          maxWidth: theme.semantics.container.md.size * 3,
          flexShrink: 0,
        }}
        color={theme.colors[request.kind]}
      >
        <ThemedIcon size={theme.icongraphy.sizes.xs} icon={KindIcon} />
        <ThemedText
          style={{
            flexShrink: 1,
            ...theme.typography.body.sm,
            fontWeight: theme.fontWeights.medium,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {request.kindLabel}
        </ThemedText>
      </Chip>
    </ThemedPressable>
  )
}
