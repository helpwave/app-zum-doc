import { Image } from "expo-image"
import { Calendar, ChevronRight, MessageCircle, Pill } from "lucide-react-native"
import { useAppTranslation } from "app-zum-doc-utils/hooks"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"
import type { HomeSummary } from "@/api/mock/types"

const practiceLogo = require("../assets/images/practice-logo.png")

type HomeHeroProps = {
  summary: HomeSummary
}

export function HomeHero({ summary }: HomeHeroProps) {
  const t = useAppTranslation()

  return (
    <View style={styles.hero}>
      <Text style={styles.greeting}>
        {summary.greeting}, {summary.patientFirstName}
      </Text>
      <View style={styles.practiceRow}>
        <Image
          source={practiceLogo}
          style={styles.logo}
          contentFit="cover"
        />
        <View style={styles.practiceText}>
          <Text style={styles.practiceName}>{summary.practiceName}</Text>
          <Text style={styles.practiceMeta}>{t("yourPractice")}</Text>
        </View>
      </View>
    </View>
  )
}

type NextAppointmentCardProps = {
  appointment: NonNullable<HomeSummary["nextAppointment"]>
}

export function NextAppointmentCard({ appointment }: NextAppointmentCardProps) {
  const t = useAppTranslation()

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconTile}>
          <Calendar size={18} color={azd.green[600]} />
        </View>
        <Text style={styles.cardEyebrow}>{t("nextAppointment")}</Text>
      </View>
      <Text style={styles.cardTitle}>{appointment.title}</Text>
      <Text style={styles.cardDetail}>{appointment.dateLabel}</Text>
      <Text style={styles.cardMeta}>
        {appointment.timeLabel} · {appointment.room}
      </Text>
      <Text style={styles.cardDoctor}>{appointment.doctorName}</Text>
    </View>
  )
}

type QuickActionsProps = {
  actions: HomeSummary["quickActions"]
  onPress: (href: string) => void
}

const actionIcons = {
  message: MessageCircle,
  prescriptions: Pill,
  appointments: Calendar,
} as const

export function QuickActions({ actions, onPress }: QuickActionsProps) {
  const t = useAppTranslation()
  const labels = {
    message: t("actionMessage"),
    prescriptions: t("actionPrescriptions"),
    appointments: t("actionAppointments"),
  } as const

  return (
    <View style={styles.actions}>
      {actions.map((action) => {
        const Icon =
          actionIcons[action.id as keyof typeof actionIcons] ?? MessageCircle
        const label =
          labels[action.id as keyof typeof labels] ?? action.label
        return (
          <Pressable
            key={action.id}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            onPress={() => onPress(action.href)}
          >
            <View style={styles.actionIcon}>
              <Icon size={18} color={azd.green[600]} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
            <ChevronRight size={16} color={azd.fg[7]} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    gap: azd.space[4],
    marginBottom: azd.space[5],
  },
  greeting: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 28,
    color: azd.green[600],
  },
  practiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: azd.space[3],
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: azd.green[100],
  },
  practiceText: {
    gap: 2,
  },
  practiceName: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 16,
    color: azd.fg[1],
  },
  practiceMeta: {
    fontSize: 13,
    color: azd.fg[5],
  },
  card: {
    backgroundColor: azd.bg.surface,
    borderRadius: azd.radius.md,
    borderWidth: 1,
    borderColor: azd.border,
    padding: azd.space[4],
    gap: 4,
    marginBottom: azd.space[5],
    ...azd.shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: azd.radius.sm,
    backgroundColor: "rgba(5,121,134,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEyebrow: {
    fontFamily: azd.font.tabular,
    fontWeight: "700",
    fontSize: 12,
    color: azd.green[600],
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 18,
    color: azd.fg[1],
  },
  cardDetail: {
    fontSize: 15,
    color: azd.fg[3],
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: azd.fg[4],
  },
  cardDoctor: {
    marginTop: 8,
    fontSize: 13,
    color: azd.fg[5],
  },
  actions: {
    gap: azd.space[2],
    marginBottom: azd.space[5],
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: azd.space[3],
    backgroundColor: azd.bg.surface,
    borderRadius: azd.radius.md,
    borderWidth: 1,
    borderColor: azd.border,
    paddingHorizontal: azd.space[4],
    paddingVertical: 14,
  },
  actionPressed: {
    backgroundColor: azd.bg.app,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    flex: 1,
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 15,
    color: azd.fg[1],
  },
})
