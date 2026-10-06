import { AppBar } from "@/components/app-bar"
import { LabeledField } from "@/components/labeled-field"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useKeyBoard } from "@/hooks/useKeyBoardIsVisible"
import { readFileInputItemText } from "@/lib/backup-file"
import { isAzdBackupFileName, loadBackupV1, type BackupData } from "@app-zum-doc/utils/api"
import {
  Button,
  FileInput,
  IconButton,
  Input,
  ThemedText,
  type FileInputItem,
} from "@helpwave/hightide-native/components"
import { ChevronLeft } from "lucide-react-native"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type OnboardingBackupLoadProps = {
  onBack: () => void
  onLoaded: (backup: BackupData) => void
}

export function OnboardingBackupLoad({ onBack, onLoaded }: OnboardingBackupLoadProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const { isVisible: isKeyboardVisible } = useKeyBoard()
  const [files, setFiles] = useState<FileInputItem[]>([])
  const [password, setPassword] = useState("")
  const [fileError, setFileError] = useState<string>()
  const [importFailed, setImportFailed] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const selectedFile = files[0]
  const selectedFileInvalid = selectedFile != null
    && selectedFile.name.length > 0
    && !isAzdBackupFileName(selectedFile.name)
  const canLoad = selectedFile != null
    && password.length > 0
    && !selectedFileInvalid
    && !isImporting

  const onLoad = async () => {
    if (!canLoad || selectedFile == null) {
      return
    }
    setIsImporting(true)
    setImportFailed(false)
    try {
      const text = await readFileInputItemText(selectedFile)
      const payload = await loadBackupV1(text, password)
      onLoaded(payload)
    } catch {
      setImportFailed(true)
      setIsImporting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
    >
      <AppBar
        title={t("onboardingRestoreBackup")}
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
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText appearance="description" style={theme.typography.body.md}>
          {t("migrationDescription")}
        </ThemedText>
        <LabeledField label={t("migrationSelectFile")}>
          <FileInput
            value={files}
            maxFiles={1}
            invalid={selectedFileInvalid || fileError != null}
            onValueChange={(next) => {
              setFiles([...next])
              setFileError(undefined)
              setImportFailed(false)
            }}
            onEditComplete={(next) => {
              const nextFile = next[0]
              if (nextFile != null && !isAzdBackupFileName(nextFile.name)) {
                setFileError(t("migrationInvalidFile"))
              }
            }}
          />
        </LabeledField>
        {fileError || selectedFileInvalid ? (
          <ThemedText
            style={{
              ...theme.typography.body.sm,
              color: theme.colors.negative.color,
            }}
          >
            {fileError ?? t("migrationInvalidFile")}
          </ThemedText>
        ) : null}
        <LabeledField label={t("migrationPassword")}>
          <Input
            value={password}
            onValueChange={(value) => {
              setPassword(value)
              setImportFailed(false)
            }}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            style={{ width: "100%" }}
          />
        </LabeledField>
        {importFailed ? (
          <ThemedText
            style={{
              ...theme.typography.body.sm,
              color: theme.colors.negative.color,
            }}
          >
            {t("migrationBackupLoadedFailure")}
          </ThemedText>
        ) : null}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg + insets.bottom,
        }}
      >
        <Button
          disabled={!canLoad}
          isProcessing={isImporting}
          onPress={() => {
            void onLoad()
          }}
        >
          {t("onboardingLoad")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
