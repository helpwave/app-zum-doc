import { DateInput } from "@/components/date-input"
import { LabeledField } from "@/components/labeled-field"
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
import { Button, Input, Select } from "@helpwave/hightide-native/components"
import { Plus } from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
import { View } from "react-native"

export type ProfileFormValues = {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  insuranceType: InsuranceType
  insuranceProviderId: string | null
  insuranceNumber: string
}

type ProfileFormFieldsProps = {
  values: ProfileFormValues
  onChange: (values: ProfileFormValues) => void
}

export function emptyProfileFormValues(): ProfileFormValues {
  return {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    insuranceType: "public",
    insuranceProviderId: null,
    insuranceNumber: "",
  }
}

export function profileFormValuesFromPatient(profile: PatientProfile): ProfileFormValues {
  const company = findInsuranceCompany(profile.insurance.insuranceProviderId)
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: toIsoDate(profile.dateOfBirth),
    email: profile.email,
    phone: profile.phone,
    insuranceType: company?.type ?? "public",
    insuranceProviderId: profile.insurance.insuranceProviderId || null,
    insuranceNumber: profile.insurance.insuranceNumber,
  }
}

export function isProfileFormReady(values: ProfileFormValues): boolean {
  return values.firstName.trim().length > 0
    && values.lastName.trim().length > 0
    && values.dateOfBirth.length > 0
}

export function ProfileFormFields({ values, onChange }: ProfileFormFieldsProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const today = startOfDay(new Date())
  const [showEmail, setShowEmail] = useState(values.email.trim().length > 0)
  const [showPhone, setShowPhone] = useState(values.phone.trim().length > 0)
  const [showInsurance, setShowInsurance] = useState(
    (values.insuranceProviderId ?? "").length > 0 || values.insuranceNumber.trim().length > 0,
  )
  const insuranceOptions = useMemo(() =>
    filterInsuranceCompaniesByType(values.insuranceType).map((company) => ({
      id: company.id,
      label: company.name,
    })), [values.insuranceType])

  const valuesRef = useRef(values)
  valuesRef.current = values

  useEffect(() => {
    const current = valuesRef.current
    const selectedCompany = findInsuranceCompany(current.insuranceProviderId ?? "")
    if (selectedCompany && selectedCompany.type !== current.insuranceType) {
      onChange({
        ...current,
        insuranceProviderId: null,
      })
    }
  }, [onChange, values.insuranceProviderId, values.insuranceType])

  const update = (patch: Partial<ProfileFormValues>) => {
    onChange({
      ...values,
      ...patch,
    })
  }

  return (
    <View style={{ gap: theme.spacing.lg, width: "100%" }}>
      <LabeledField label={t("firstName")}>
        <Input
          value={values.firstName}
          onValueChange={(firstName) => {
            update({ firstName })
          }}
          autoComplete="given-name"
          textContentType="givenName"
          style={{ width: "100%" }}
        />
      </LabeledField>
      <LabeledField label={t("lastName")}>
        <Input
          value={values.lastName}
          onValueChange={(lastName) => {
            update({ lastName })
          }}
          autoComplete="family-name"
          textContentType="familyName"
          style={{ width: "100%" }}
        />
      </LabeledField>
      <LabeledField label={t("dateOfBirth")}>
        <DateInput
          value={values.dateOfBirth}
          onValueChange={(dateOfBirth) => {
            update({ dateOfBirth })
          }}
          placeholder={t("dateOfBirth")}
          title={t("selectDateOfBirth")}
          hasYearSelect
          startDate={toIsoDate(new Date(today.getFullYear() - 120, 0, 1))}
          endDate={toIsoDate(today)}
        />
      </LabeledField>
      {showEmail ? (
        <LabeledField label={t("email")}>
          <Input
            value={values.email}
            onValueChange={(email) => {
              update({ email })
            }}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={{ width: "100%" }}
          />
        </LabeledField>
      ) : (
        <Button
          variant="tonal"
          leadingIcon={Plus}
          onPress={() => {
            setShowEmail(true)
          }}
          style={{ alignSelf: "flex-start" }}
        >
          {t("addEmail")}
        </Button>
      )}
      {showPhone ? (
        <LabeledField label={t("phoneNumber")}>
          <Input
            value={values.phone}
            onValueChange={(phone) => {
              update({ phone })
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            style={{ width: "100%" }}
          />
        </LabeledField>
      ) : (
        <Button
          variant="tonal"
          leadingIcon={Plus}
          onPress={() => {
            setShowPhone(true)
          }}
          style={{ alignSelf: "flex-start" }}
        >
          {t("addPhoneNumber")}
        </Button>
      )}
      {showInsurance ? (
        <View style={{ gap: theme.spacing.lg, width: "100%" }}>
          <Section title={t("insuranceType")}>
            <SegmentedControl
              value={values.insuranceType}
              onChange={(insuranceType) => {
                update({ insuranceType })
              }}
              options={[
                { id: "public", label: t("insuranceStatutory") },
                { id: "private", label: t("insurancePrivate") },
              ]}
            />
          </Section>
          <LabeledField label={t("insuranceProvider")}>
            <Select
              value={values.insuranceProviderId}
              onValueChange={(insuranceProviderId) => {
                update({ insuranceProviderId })
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
              value={values.insuranceNumber}
              onValueChange={(insuranceNumber) => {
                update({ insuranceNumber })
              }}
              autoCapitalize="characters"
              style={{ width: "100%" }}
            />
          </LabeledField>
        </View>
      ) : (
        <Button
          variant="tonal"
          leadingIcon={Plus}
          onPress={() => {
            setShowInsurance(true)
          }}
          style={{ alignSelf: "flex-start" }}
        >
          {t("addInsurance")}
        </Button>
      )}
    </View>
  )
}
