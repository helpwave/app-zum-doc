import { AppBar } from "@/components/app-bar"
import { DateInput } from "@/components/date-input"
import { LabeledField } from "@/components/labeled-field"
import { QueryState } from "@/components/query-state"
import { Section } from "@/components/section"
import { SegmentedControl } from "@/components/segmented-control"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  filterInsuranceCompaniesByType,
  findInsuranceCompany,
  startOfDay,
  toIsoDate,
  type InsuranceType,
  type PatientProfile,
} from "@app-zum-doc/utils/api"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import {
  Input,
  Select,
} from "@helpwave/hightide-native/components"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"

type PersonalInformationFormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  insuranceType: InsuranceType
  insuranceProviderId: string | null
  insuranceNumber: string
}

function formFromProfile(profile: PatientProfile): PersonalInformationFormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: toIsoDate(profile.dateOfBirth),
    email: profile.email,
    phone: profile.phone,
    insuranceType: findInsuranceCompany(profile.insurance.insuranceProviderId)?.type ?? "public",
    insuranceProviderId: profile.insurance.insuranceProviderId || null,
    insuranceNumber: profile.insurance.insuranceNumber,
  }
}

function withInsuranceType(
  form: PersonalInformationFormState,
  insuranceType: InsuranceType,
): PersonalInformationFormState {
  const selectedCompany = findInsuranceCompany(form.insuranceProviderId ?? "")
  return {
    ...form,
    insuranceType,
    insuranceProviderId: selectedCompany && selectedCompany.type !== insuranceType
      ? null
      : form.insuranceProviderId,
  }
}

type PersonalInformationFormProps = {
  profile: PatientProfile
}

function PersonalInformationForm({ profile }: PersonalInformationFormProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const today = startOfDay(new Date())
  const [form, setForm] = useState(() => formFromProfile(profile))
  const insuranceOptions = filterInsuranceCompaniesByType(form.insuranceType).map((company) => ({
    id: company.id,
    label: company.name,
  }))

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LabeledField label={t("firstName")}>
        <Input
          value={form.firstName}
          onValueChange={(firstName) => {
            setForm((current) => ({ ...current, firstName }))
          }}
          autoComplete="given-name"
          textContentType="givenName"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("lastName")}>
        <Input
          value={form.lastName}
          onValueChange={(lastName) => {
            setForm((current) => ({ ...current, lastName }))
          }}
          autoComplete="family-name"
          textContentType="familyName"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("dateOfBirth")}>
        <DateInput
          value={form.dateOfBirth}
          onValueChange={(dateOfBirth) => {
            setForm((current) => ({ ...current, dateOfBirth }))
          }}
          placeholder={t("dateOfBirth")}
          title={t("selectDateOfBirth")}
          hasYearSelect
          startDate={toIsoDate(new Date(today.getFullYear() - 120, 0, 1))}
          endDate={toIsoDate(today)}
        />
      </LabeledField>

      <LabeledField label={t("email")}>
        <Input
          value={form.email}
          onValueChange={(email) => {
            setForm((current) => ({ ...current, email }))
          }}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <LabeledField label={t("phoneNumber")}>
        <Input
          value={form.phone}
          onValueChange={(phone) => {
            setForm((current) => ({ ...current, phone }))
          }}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          style={{ width: "100%" }}
        />
      </LabeledField>

      <Section title={t("insuranceType")}>
        <SegmentedControl
          value={form.insuranceType}
          onChange={(insuranceType) => {
            setForm((current) => withInsuranceType(current, insuranceType))
          }}
          options={[
            { id: "public", label: t("insuranceStatutory") },
            { id: "private", label: t("insurancePrivate") },
          ]}
        />
      </Section>

      <LabeledField label={t("insuranceProvider")}>
        <Select
          value={form.insuranceProviderId}
          onValueChange={(insuranceProviderId) => {
            setForm((current) => ({ ...current, insuranceProviderId }))
          }}
          placeholder={t("insuranceProvider")}
          style={{ width: "100%" }}
        >
          {insuranceOptions.map((option) => (
            <Select.Option key={option.id} value={option.id} label={option.label} />
          ))}
        </Select>
      </LabeledField>

      <LabeledField label={t("insuranceNumberOptional")}>
        <Input
          value={form.insuranceNumber}
          onValueChange={(insuranceNumber) => {
            setForm((current) => ({ ...current, insuranceNumber }))
          }}
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
  const profileQuery = usePatientProfile()

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppBar
        title={t("personalInformation")}
      />
      <QueryState
        isPending={profileQuery.isPending}
        isError={profileQuery.isError}
        error={profileQuery.error}
        onRetry={() => {
          void profileQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
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
