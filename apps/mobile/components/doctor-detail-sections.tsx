import { AppBar } from "@/components/app-bar"
import { RequestTile, StartQuickActionCard } from "@/components/home-sections"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { WeekdayUtils, doctorsOfficeStatusFromOpeningHours, formatAddress, formatAddressLines, hasAddressContent, type DoctorsOffice, type RequestBase, type PatientRequestType } from "@app-zum-doc/utils/api"
import { homeQuickActions } from "@/lib/quick-actions"
import { Button, Card, Divider, IconButton, ListActionItem, ListItem, ListNavigationItem, ThemedIcon } from "@helpwave/hightide-native/components"
import { ContentThemeOverrideProvider } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import {
  BriefcaseMedical,
  ChevronRight,
  Ellipsis,
  Globe,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  UserMinus,
} from "lucide-react-native"
import { useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Section } from "./section"

const doctorPortrait = require("../assets/images/doctor-portrait.png")

function hasText(value?: string): boolean {
  return (value?.trim().length ?? 0) > 0
}

type DoctorDetailHeroProps = {
  office: DoctorsOffice
  isMyDoctor: boolean
  onAddDoctor: () => void
  onRemoveDoctor: () => void
  isAddingDoctor?: boolean
  isRemovingDoctor?: boolean
  onQuickActionPress: (actionId: PatientRequestType) => void
}

export function DoctorDetailHero({
  office,
  isMyDoctor,
  onAddDoctor,
  onRemoveDoctor,
  isAddingDoctor = false,
  isRemovingDoctor = false,
  onQuickActionPress,
}: DoctorDetailHeroProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const insets = useSafeAreaInsets()
  const window = useWindowDimensions()
  const moreButtonRef = useRef<View>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const openMenu = () => {
    moreButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height })
      setMenuOpen(true)
    })
  }

  const confirmRemoveDoctor = () => {
    closeMenu()
    setTimeout(() => {
      Alert.alert(t("removeDoctor"), t("removeDoctorConfirm"), [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("removeDoctor"),
          style: "destructive",
          onPress: onRemoveDoctor,
        },
      ])
    }, 150)
  }

  return (
    <>
      <LinearGradient
        colors={[colors.heroStart, colors.heroEnd]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: theme.spacing.lg + theme.spacing.sm,
          overflow: "hidden",
        }}
      >
        <AppBar
          trailing={
            isMyDoctor ? (
              <View ref={moreButtonRef} collapsable={false}>
                <IconButton
                  icon={Ellipsis}
                  accessibilityLabel={t("moreOptions")}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isRemovingDoctor, busy: isRemovingDoctor }}
                  disabled={isRemovingDoctor}
                  onPress={openMenu}
                  variant="foreground"
                  color={theme.colors.surfaceInverse}
                />
              </View>
            ) : null
          }
          style={{
            backgroundColor: "#FFFFFF00"
          }}
        />

        <View 
          style={{
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
        >
          <DoctorSummaryCard office={office} />

          {isMyDoctor ? (
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
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isAddingDoctor, busy: isAddingDoctor }}
              disabled={isAddingDoctor}
              onPress={onAddDoctor}
              style={{
                height: theme.semantics.control.md.size,
                borderRadius: 9999,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.md,
                backgroundColor: colors.ctaBackground,
                opacity: isAddingDoctor ? 0.7 : 1,
              }}
            >
              {isAddingDoctor ? (
                <ActivityIndicator
                  size="small"
                  color={colors.ctaText}
                />
              ) : (
                <Plus size={theme.icongraphy.sizes.sm} color={colors.ctaText} strokeWidth={2.2} />
              )}
              <Text
                style={{
                  ...theme.typography.body.md,
                  fontWeight: theme.fontWeights.medium,
                  color: colors.ctaText,
                }}
              >
                {t("addAsMyDoctor")}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeMenu}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={closeMenu}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              position: "absolute",
              top: menuAnchor.y + menuAnchor.height + theme.spacing.sm,
              right: window.width - (menuAnchor.x + menuAnchor.width),
              minWidth: 220,
              boxShadow: StyleAdapterUtils.shadow(theme.shadow.popover),
            }}
          >
            <Card>
              <ListActionItem
                title={t("removeDoctor")}
                color={theme.colors.negative}
                leading={<ThemedIcon icon={UserMinus} />}
                onPress={confirmRemoveDoctor}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

type DoctorSummaryCardProps = {
  office: DoctorsOffice
}

export function DoctorSummaryCard({
  office,
}: DoctorSummaryCardProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const status = doctorsOfficeStatusFromOpeningHours(office.openingHours)
  const imageSource =
    office.imageUri === "doctor-portrait"
      ? doctorPortrait
      : office.imageUri
        ? { uri: office.imageUri }
        : doctorPortrait

  return (
    <View
      pointerEvents="none"
      style={{
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        gap: theme.spacing.md + theme.spacing.xs,
        padding: theme.spacing.md + theme.spacing.xs,
        height: 137,
        backgroundColor: colors.cardBackground,
        boxShadow: StyleAdapterUtils.shadow(theme.shadow.container),
      }}
    >
      <Image
        source={imageSource}
        style={{
          width: 97,
          flexGrow: 0,
          flexShrink: 0,
          borderRadius: theme.borderRadius.md,
          borderWidth: theme.borderWidth.thin,
          borderColor: colors.cardBorder,
        }}
        contentFit="cover"
      />
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
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
            {office.specialization}
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
              height: 12,
              borderRadius: 9999,
              backgroundColor: status === "open"
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
            {t("officeStatus", { status })}
          </Text>
        </View>
      </View>
    </View>
  )
}

type DoctorRequestsSectionProps = {
  requests: RequestBase[]
  onShowAll: () => void
  onRequestPress: (requestId: string) => void
}

export function DoctorRequestsSection({
  requests,
  onShowAll,
  onRequestPress,
}: DoctorRequestsSectionProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <Section
      title={t("myRequests")}
      trailing={
        <Button
          accessibilityRole="button"
          onPress={onShowAll}
          size="xs"
          color={{ color: theme.colors.surface.onColor, onColor: theme.colors.surface.color }}
          trailingIcon={ChevronRight}
          variant="foreground"
        >
          {t("showAll")}
        </Button>
      }
    >
      {requests.map((request) => (
        <RequestTile
          key={request.id}
          request={request}
          onPress={() => onRequestPress(request.id)}
        />
      ))}
    </Section>
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
        {WeekdayUtils.array.map((day, index) => {
          const isLast = index === WeekdayUtils.array.length - 1
          const times = openingHours[day] ?? []
          const isClosed = times.length === 0

          return (
            <ListItem
              key={day}
              style={[
                !isLast && {
                  borderBottomWidth: theme.borderWidth.thin,
                  borderBottomColor: colors.rowDivider,
                },
              ]}
              title={t("weekday", { day })}
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
                  {times.map((time) => (
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

type DoctorOfficeActionCardProps = {
  title: string
  icon: typeof Phone
  onPress: () => void
}

export function DoctorOfficeActionCard({
  title,
  icon,
  onPress,
}: DoctorOfficeActionCardProps) {
  return (
    <Card>
      <DoctorOfficeActionItem title={title} icon={icon} onPress={onPress} />
    </Card>
  )
}

function DoctorOfficeActionItem({
  title,
  icon,
  onPress,
}: DoctorOfficeActionCardProps) {
  return (
    <ListNavigationItem
      title={title}
      leading={<ThemedIcon icon={icon} />}
      onPress={onPress}
    />
  )
}

export function DoctorOfficeContactSections({
  office,
  onServicesPress,
  onOffersPress,
}: {
  office: DoctorsOffice
  onServicesPress: () => void
  onOffersPress: () => void
}) {
  const t = useAppTranslation()
  const hasAddress = hasAddressContent(office.address)
  const hasServices = office.services.length > 0
  const hasOffers = office.offers.length > 0
  const [addressLine1, addressLine2] = formatAddressLines(office.address)
  const addressTitle = [addressLine1, addressLine2]
    .filter((line) => hasText(line))
    .join("\n")
  const offersTitle = office.offers.length === 1
    ? office.offers[0]!.name
    : t("furtherOffers")

  return (
    <>
      {office.phoneNumber ? (
        <Section title={t("phone")}>
          <DoctorOfficeActionCard
            title={office.phoneNumber}
            icon={Phone}
            onPress={() => {
              openDoctorsOfficePhone(office.phoneNumber!)
            }}
          />
        </Section>
      ) : null}

      {hasAddress ? (
        <Section title={t("address")}>
          <DoctorOfficeActionCard
            title={addressTitle}
            icon={MapPin}
            onPress={() => {
              openDoctorsOfficeNavigation(office.address)
            }}
          />
        </Section>
      ) : null}

      {hasText(office.websiteUrl) ? (
        <Section title={t("website")}>
          <DoctorOfficeActionCard
            title={office.websiteUrl!}
            icon={Globe}
            onPress={() => {
              openDoctorsOfficeWebsite(office.websiteUrl!)
            }}
          />
        </Section>
      ) : null}

      {hasServices || hasOffers ? (
        <Section title={t("servicesAndOffers")}>
          <Card>
            {hasServices ? (
              <DoctorOfficeActionItem
                title={t("ourServices")}
                icon={BriefcaseMedical}
                onPress={onServicesPress}
              />
            ) : null}
            {hasServices && hasOffers ? <Divider /> : null}
            {hasOffers ? (
              <DoctorOfficeActionItem
                title={offersTitle}
                icon={Sparkles}
                onPress={onOffersPress}
              />
            ) : null}
          </Card>
        </Section>
      ) : null}
    </>
  )
}

export function openDoctorsOfficePhone(phone: string): void {
  const digits = phone.replace(/[^\d+]/g, "")
  void Linking.openURL(`tel:${digits}`)
}

export function openDoctorsOfficeWebsite(url: string): void {
  void Linking.openURL(url)
}

export function openDoctorsOfficeNavigation(address: DoctorsOffice["address"]): void {
  const query = encodeURIComponent(formatAddress(address))
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${query}`
      : Platform.OS === "android"
        ? `geo:0,0?q=${query}`
        : `https://www.google.com/maps/dir/?api=1&destination=${query}`

  void Linking.openURL(url)
}
