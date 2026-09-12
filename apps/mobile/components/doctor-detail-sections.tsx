import { AppBar } from "@/components/app-bar"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RequestTile, StartQuickActionCard } from "@/components/home-sections"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { WeekdayUtils, doctorsOfficeStatusFromOpeningHours, formatAddress, formatAddressLines, hasAddressContent, type DoctorsOffice, type RequestBase, type PatientRequestType } from "@app-zum-doc/utils/api"
import { homeQuickActions } from "@/lib/quick-actions"
import { Button, Card, Divider, IconButton, ListActionItem, ListItem, ListNavigationItem, ThemedIcon, ThemedText } from "@helpwave/hightide-native/components"
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
import { useMemo, useRef, useState } from "react"
import {
  ColorValue,
  Linking,
  Modal,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native"
import { Section } from "./section"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"

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
  const window = useWindowDimensions()
  const moreButtonRef = useRef<View>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)

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
      setRemoveConfirmOpen(true)
    }, 150)
  }

  const heroColors = useMemo(() => {
    const color = theme.colors.primary.color
    const start = OKLCHUtils.changeLightness(color, 0.45)
    const end = OKLCHUtils.changeLightness(color, 0.6)
    const gradient: readonly [ColorValue, ColorValue, ...ColorValue[]] = [start, end]
    return gradient
  }, [theme.colors.primary.color])

  return (
    <>
      <LinearGradient
        colors={heroColors}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: theme.spacing.lg + theme.spacing.sm,
          overflow: "hidden",
        }}
      >
        <AppBar
          color={{color: "#FFFFFF00", onColor: theme.colors.primary.onColor}}
          trailing={
            isMyDoctor ? (
              <View ref={moreButtonRef} collapsable={false}>
                <IconButton
                  icon={Ellipsis}
                  accessibilityLabel={t("moreOptions")}
                  isProcessing={isRemovingDoctor}
                  onPress={openMenu}
                  variant="foreground"
                  color={{color:  theme.colors.primary.onColor, onColor: "#FFFFFF00"}}
                />
              </View>
            ) : null
          }
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
            <Button
              isProcessing={isAddingDoctor}
              onPress={onAddDoctor}
              variant="tonal"
              style={{
                ...StyleAdapterUtils.borderRadius({type: "all",  value: 999 }),
              }}
              leadingIcon={Plus}
            >
              {t("addAsMyDoctor")}
            </Button>
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
      <ConfirmationModal
        isOpen={removeConfirmOpen}
        onIsOpenChange={setRemoveConfirmOpen}
        title={t("removeDoctor")}
        message={t("removeDoctorConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("removeDoctor")}
        confirmColor={theme.colors.negative}
        onConfirm={onRemoveDoctor}
      />
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
        height: theme.semantics.touchTargetSize({}) * 3,
        backgroundColor: theme.colors.surface.color,
        boxShadow: StyleAdapterUtils.shadow(theme.shadow.container),
      }}
    >
      <Image
        source={imageSource}
        style={{
          width: theme.semantics.touchTargetSize({}) * 2,
          flexGrow: 0,
          flexShrink: 0,
          borderRadius: theme.borderRadius.md,
          borderWidth: theme.borderWidth.thin,
          borderColor: theme.colors.border,
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
          <ThemedText
            style={{
              ...theme.typography.heading.md,
              color: theme.colors.surface.onColor,
            }}
          >
            {office.name}
          </ThemedText>
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.sm,
            }}
          >
            {office.specialization}
          </ThemedText>
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
                ? theme.colors.primary.color
                : theme.colors.disabled.color,
            }}
          />
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.sm,
            }}
          >
            {t("officeStatus", { status })}
          </ThemedText>
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
  note?: string
}

export function OpeningHoursSection({
  openingHours,
  note,
}: OpeningHoursSectionProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const noteText = note?.trim() ?? ""

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
                  borderBottomColor: theme.colors.border,
                },
              ]}
              title={t("weekday", { day })}
              trailing={isClosed ? (
                <ThemedText
                  appearance="description"
                  style={{
                    ...theme.typography.body.md,
                  }}
                >
                  {t("closed")}
                </ThemedText>
              ) : (
                <View
                  style={{
                    alignItems: "flex-end",
                    gap: theme.spacing.md,
                  }}
                >
                  {times.map((time) => (
                    <ThemedText
                      key={time}
                      style={{
                        ...theme.typography.body.md,
                      }}
                    >
                      {time}
                    </ThemedText>
                  ))}
                </View>
              )}
            />
          )
        })}
      </Card>
      {noteText.length > 0 ? (
        <ThemedText
          appearance="description"
          style={{
            ...theme.typography.body.md,
          }}
        >
          {noteText}
        </ThemedText>
      ) : null}
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
