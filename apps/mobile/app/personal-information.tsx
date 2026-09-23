import { AppBar } from "@/components/app-bar"
import { QueryState } from "@/components/query-state"
import { ProfileFormFields, profileFormValuesFromPatient, type ProfileFormValues } from "@/components/profile-form-fields"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"

type PersonalInformationFormProps = {
  values: ProfileFormValues
  onChange: (values: ProfileFormValues) => void
}

function PersonalInformationForm({ values, onChange }: PersonalInformationFormProps) {
  const { theme } = useAzdTheme()

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ProfileFormFields values={values} onChange={onChange} />
    </ScrollView>
  )
}

export default function PersonalInformationScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const profileQuery = usePatientProfile()
  const [values, setValues] = useState<ProfileFormValues | null>(null)
  const profile = profileQuery.data
  const formValues = values ?? (profile == null ? null : profileFormValuesFromPatient(profile))

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
        {formValues ? (
          <View
            style={{
              flex: 1,
            }}
          >
            <PersonalInformationForm
              values={formValues}
              onChange={setValues}
            />
          </View>
        ) : null}
      </QueryState>
    </KeyboardAvoidingView>
  )
}
