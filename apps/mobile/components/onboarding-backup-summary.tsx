import { AppBar } from "@/components/app-bar"
import { onboardingProfileDateLabel } from "@/components/onboarding-profile-date"
import { Section } from "@/components/section"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  patientProfileFullName,
  toAppLocale,
  type AppOnboardingProfileInput,
  type ChatJson,
  type DoctorJson,
  type RequestJson,
} from "@app-zum-doc/utils/api"
import { Button, Card, IconButton, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { ChevronLeft } from "lucide-react-native"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type OnboardingBackupSummaryProps = {
  profiles: AppOnboardingProfileInput[]
  doctors: DoctorJson[]
  chats: ChatJson[]
  requests: RequestJson[]
  onBack: () => void
  onContinue: () => void
}

function doctorLabel(doctor: DoctorJson): string {
  if (doctor.practiceName != null && doctor.practiceName.length > 0) {
    return doctor.practiceName
  }
  return [doctor.title, doctor.firstName, doctor.lastName]
    .filter((part) => part != null && part.length > 0)
    .join(" ")
}

function chatLabel(chat: ChatJson, doctors: DoctorJson[]): string {
  const doctor = doctors.find((item) => String(item.id) === chat.doctorId)
  return doctor == null ? chat.doctorId : doctorLabel(doctor)
}

export function OnboardingBackupSummary({
  profiles,
  doctors,
  chats,
  requests,
  onBack,
  onContinue,
}: OnboardingBackupSummaryProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar
        title={t("onboardingBackupSummaryTitle")}
        noDefaultBackNavigation
        leading={(
          <IconButton
            icon={ChevronLeft}
            variant="foreground"
            accessibilityLabel={t("back")}
            onPress={onBack}
          />
        )}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Section title={t("profiles")}>
          <View style={{ gap: theme.spacing.md }}>
            {profiles.length === 0 ? (
              <ThemedText appearance="description" style={theme.typography.body.md}>
                {t("onboardingBackupEmpty")}
              </ThemedText>
            ) : profiles.map((profile) => (
              <Card key={profile.id}>
                <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
                  <ThemedText
                    style={{
                      ...theme.typography.body.md,
                      fontWeight: theme.fontWeights.semibold,
                    }}
                  >
                    {patientProfileFullName(profile)}
                  </ThemedText>
                  <ThemedText appearance="description" style={theme.typography.body.sm}>
                    {onboardingProfileDateLabel(profile.dateOfBirth, locale)}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </Section>
        <Section title={t("myDoctors")}>
          <View style={{ gap: theme.spacing.md }}>
            {doctors.length === 0 ? (
              <ThemedText appearance="description" style={theme.typography.body.md}>
                {t("onboardingBackupEmpty")}
              </ThemedText>
            ) : doctors.map((doctor) => (
              <Card key={doctor.id}>
                <View style={{ padding: theme.spacing.md }}>
                  <ThemedText style={theme.typography.body.md}>
                    {doctorLabel(doctor)}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </Section>
        <Section title={t("chatsTitle")}>
          <View style={{ gap: theme.spacing.md }}>
            {chats.length === 0 ? (
              <ThemedText appearance="description" style={theme.typography.body.md}>
                {t("onboardingBackupEmpty")}
              </ThemedText>
            ) : chats.map((chat, index) => (
              <Card key={`${chat.doctorId}-${index}`}>
                <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
                  <ThemedText style={theme.typography.body.md}>
                    {chatLabel(chat, doctors)}
                  </ThemedText>
                  <ThemedText appearance="description" style={theme.typography.body.sm}>
                    {t("onboardingBackupMessageCount", { count: chat.messages.length })}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </Section>
        <Section title={t("myRequests")}>
          <View style={{ gap: theme.spacing.md }}>
            {requests.length === 0 ? (
              <ThemedText appearance="description" style={theme.typography.body.md}>
                {t("onboardingBackupEmpty")}
              </ThemedText>
            ) : requests.map((request) => (
              <Card key={`${request.doctorId}-${request.requestId}-${request.id ?? request.title}`}>
                <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
                  <ThemedText style={theme.typography.body.md}>
                    {request.title}
                  </ThemedText>
                  <ThemedText appearance="description" style={theme.typography.body.sm}>
                    {request.doctorName}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </Section>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg + insets.bottom,
        }}
      >
        <Button onPress={onContinue}>
          {t("onboardingNext")}
        </Button>
      </View>
    </View>
  )
}
