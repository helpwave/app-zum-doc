import { LabeledField } from "@/components/labeled-field"
import { NavigationHeader } from "@/components/navigation-header"
import { QueryState } from "@/components/query-state"
import { Section } from "@/components/section"
import { SegmentedControl } from "@/components/segmented-control"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  federalStates,
  insuranceKindFromType,
  insuranceProviders,
  toSelectOptions,
  type InsuranceKind,
} from "@/lib/personal-information"
import { toAppLocale, type PatientProfile } from "@app-zum-doc/utils/api"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import {
  IconButton,
  Input,
  Select,
  ThemedIcon,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter } from "expo-router"
import { Calendar, X } from "lucide-react-native"
import { useMemo, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"

type PersonalInformationFormProps = {
  profile: PatientProfile
}

function PersonalInformationForm({ profile }: PersonalInformationFormProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)

  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth)
  const [phone, setPhone] = useState(profile.phone)
  const [insuranceKind, setInsuranceKind] = useState<InsuranceKind>(
    insuranceKindFromType(profile.insuranceType),
  )
  const [insuranceProviderId, setInsuranceProviderId] = useState(
    profile.insuranceProviderId,
  )
  const [federalStateId, setFederalStateId] = useState<string | undefined>(
    profile.federalStateId,
  )
  const [insuranceNumber, setInsuranceNumber] = useState(profile.insuranceNumber)

  const insuranceOptions = useMemo(
    () => toSelectOptions(insuranceProviders, locale),
    [locale],
  )
  const federalStateOptions = useMemo(
    () => toSelectOptions(federalStates, locale),
    [locale],
  )

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LabeledField label={t("firstName")}>
        <Input
          value={firstName}
          onValueChange={setFirstName}
          autoComplete="given-name"
          textContentType="givenName"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("lastName")}>
        <Input
          value={lastName}
          onValueChange={setLastName}
          autoComplete="family-name"
          textContentType="familyName"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField
        label={t("dateOfBirth")}
        trailing={
          <ThemedIcon
            icon={Calendar}
            size={theme.icongraphy.sizes.md}
            accessibilityLabel={t("selectDateOfBirth")}
          />
        }
      >
        <Input
          value={dateOfBirth}
          onValueChange={setDateOfBirth}
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("phoneNumber")}>
        <Input
          value={phone}
          onValueChange={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <Section title={t("insuranceType")}>
        <SegmentedControl
          value={insuranceKind}
          onChange={setInsuranceKind}
          options={[
            { id: "statutory", label: t("insuranceStatutory") },
            { id: "private", label: t("insurancePrivate") },
          ]}
        />
      </Section>

      <LabeledField label={t("insuranceProvider")}>
        <Select
          options={insuranceOptions}
          value={insuranceProviderId}
          onValueChange={setInsuranceProviderId}
          placeholder={t("insuranceProvider")}
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField
        label={t("federalState")}
        trailing={federalStateId ? (
          <IconButton
            icon={X}
            size="sm"
            variant="foreground"
            accessibilityLabel={t("clearSelection")}
            onPress={() => {
              setFederalStateId(undefined)
            }}
          />
        ) : undefined}
      >
        <Select
          options={federalStateOptions}
          value={federalStateId}
          onValueChange={setFederalStateId}
          placeholder={t("federalState")}
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("insuranceNumberOptional")}>
        <Input
          value={insuranceNumber}
          onValueChange={setInsuranceNumber}
          autoCapitalize="characters"
          style={{ width: "100%" }}
        />
      </LabeledField>
    </ScrollView>
  )
}

export default function PersonalInformationScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const profileQuery = usePatientProfile()

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NavigationHeader
        title={t("personalInformation")}
        onBack={() => router.back()}
      />
      <QueryState
        isPending={profileQuery.isPending}
        isError={profileQuery.isError}
        error={profileQuery.error}
        onRetry={() => {
          void profileQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
        style={{ backgroundColor: colors.background }}
      >
        {profileQuery.data ? (
          <View
            style={{
              flex: 1,
            }}
          >
            <PersonalInformationForm profile={profileQuery.data} />
          </View>
        ) : null}
      </QueryState>
    </KeyboardAvoidingView>
  )
}
