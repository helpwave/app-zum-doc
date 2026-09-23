import { AppBar } from "@/components/app-bar"
import { DateInput } from "@/components/date-input"
import { LabeledField } from "@/components/labeled-field"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useKeyBoard } from "@/hooks/useKeyBoardIsVisible"
import { startOfDay, toIsoDate } from "@app-zum-doc/utils/api"
import { useCreatePatientProfile } from "@app-zum-doc/utils/hooks"
import { Button, Input } from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"

export default function CreateProfileScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const createProfile = useCreatePatientProfile()
  const today = startOfDay(new Date())

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  const canSubmit = firstName.trim().length > 0
    && lastName.trim().length > 0
    && dateOfBirth.length > 0
    && !createProfile.isPending

  const { isVisible: isKeyboardVisible } = useKeyBoard()

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
    >
      <AppBar title={t("createProfile")} />
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
        <LabeledField label={t("dateOfBirth")}>
          <DateInput
            value={dateOfBirth}
            onValueChange={setDateOfBirth}
            placeholder={t("dateOfBirth")}
            title={t("selectDateOfBirth")}
            hasYearSelect
            startDate={toIsoDate(new Date(today.getFullYear() - 120, 0, 1))}
            endDate={toIsoDate(today)}
          />
        </LabeledField>
      </ScrollView>
      <Button
        disabled={!canSubmit}
        isProcessing={createProfile.isPending}
        onPress={() => {
          void createProfile.mutateAsync({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth,
          }).then(() => {
            router.back()
          })
        }}
        style={{ alignSelf: "flex-end" }}
      >
        {t("createProfile")}
      </Button>
    </KeyboardAvoidingView>
  )
}
