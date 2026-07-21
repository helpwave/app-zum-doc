import { Bell, Building2, ChevronRight, LogOut, UserRound } from "lucide-react-native"
import type { ReactNode } from "react"
import { useAppTranslation } from "app-zum-doc-utils/hooks"
import { Pressable, StyleSheet, Switch, Text, View } from "react-native"
import { Avatar } from "@/components/avatar"
import { azd } from "@/theme/azd-tokens"
import type { PatientProfile } from "@/api/mock/types"

type ProfileHeaderProps = {
  profile: PatientProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <Avatar
        id={profile.id}
        name={profile.fullName}
        size={72}
      />
      <Text style={styles.name}>{profile.fullName}</Text>
      <Text style={styles.meta}>
        geb. {profile.dateOfBirth} · Vers.-Nr. {profile.insuranceNumber} ·{" "}
        {profile.insuranceType}
      </Text>
    </View>
  )
}

type ProfileSectionProps = {
  title: string
  children: ReactNode
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

type ProfileInfoRowProps = {
  label: string
  value: string
}

export function ProfileInfoRow({ label, value }: ProfileInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

type ProfileNavRowProps = {
  icon: "user" | "practice" | "bell" | "logout"
  label: string
  onPress?: () => void
  danger?: boolean
  trailing?: ReactNode
}

export function ProfileNavRow({
  icon,
  label,
  onPress,
  danger = false,
  trailing,
}: ProfileNavRowProps) {
  const Icon =
    icon === "user"
      ? UserRound
      : icon === "practice"
        ? Building2
        : icon === "bell"
          ? Bell
          : LogOut

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && styles.navPressed]}
    >
      <Icon size={18} color={danger ? azd.semantic.danger : azd.green[600]} />
      <Text style={[styles.navLabel, danger && styles.navDanger]}>{label}</Text>
      {trailing ?? <ChevronRight size={16} color={azd.fg[7]} />}
    </Pressable>
  )
}

type NotificationToggleProps = {
  value: boolean
  onValueChange: (value: boolean) => void
}

export function NotificationToggle({
  value,
  onValueChange,
}: NotificationToggleProps) {
  const t = useAppTranslation()

  return (
    <ProfileNavRow
      icon="bell"
      label={t("notifications")}
      trailing={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: azd.divider, true: azd.green[300] }}
          thumbColor={value ? azd.green[600] : "#FFFFFF"}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: azd.space[2],
    paddingVertical: azd.space[5],
  },
  name: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 22,
    color: azd.fg[1],
    marginTop: azd.space[2],
  },
  meta: {
    fontFamily: azd.font.tabular,
    fontSize: 13,
    color: azd.fg[5],
    textAlign: "center",
    paddingHorizontal: azd.space[4],
  },
  section: {
    marginBottom: azd.space[5],
    gap: azd.space[2],
  },
  sectionTitle: {
    fontFamily: azd.font.tabular,
    fontWeight: "700",
    fontSize: 12,
    color: azd.fg[6],
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: azd.bg.surface,
    borderRadius: azd.radius.md,
    borderWidth: 1,
    borderColor: azd.border,
    overflow: "hidden",
  },
  infoRow: {
    paddingHorizontal: azd.space[4],
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: azd.fg[5],
  },
  infoValue: {
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 15,
    color: azd.fg[1],
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: azd.space[3],
    paddingHorizontal: azd.space[4],
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
  },
  navPressed: {
    backgroundColor: azd.bg.app,
  },
  navLabel: {
    flex: 1,
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 15,
    color: azd.fg[1],
  },
  navDanger: {
    color: azd.semantic.danger,
  },
})
