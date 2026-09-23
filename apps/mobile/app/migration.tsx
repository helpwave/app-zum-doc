import { AppBar } from "@/components/app-bar"
import { LabeledField } from "@/components/labeled-field"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { readFileInputItemText } from "@/lib/backup-file"
import {
  isAzdBackupFileName,
  loadBackupV1,
} from "@app-zum-doc/utils/api"
import { useImportPatientBackup } from "@app-zum-doc/utils/hooks"
import {
  Button,
  FileInput,
  Input,
  ThemedText,
  type FileInputItem,
} from "@helpwave/hightide-native/components"
import { useRouter, type Href } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"

const importMinimumDurationMs = 500

function waitRemaining(startedAt: number, minimumMs: number): Promise<void> {
  const remaining = minimumMs - (Date.now() - startedAt)
  if (remaining <= 0) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    setTimeout(resolve, remaining)
  })
}

export default function MigrationScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const importBackup = useImportPatientBackup()

  const [files, setFiles] = useState<FileInputItem[]>([])
  const [password, setPassword] = useState("")
  const [fileError, setFileError] = useState<string>()
  const [isImporting, setIsImporting] = useState(false)
  const [importFailed, setImportFailed] = useState(false)

  const selectedFile = files[0]
  const selectedFileInvalid = selectedFile != null
    && selectedFile.name.length > 0
    && !isAzdBackupFileName(selectedFile.name)
  const canImport = selectedFile != null
    && password.length > 0
    && !isImporting
    && !importBackup.isPending
    && !selectedFileInvalid

  const onImport = async () => {
    if (!canImport || selectedFile == null) {
      return
    }
    setIsImporting(true)
    setImportFailed(false)
    const startedAt = Date.now()
    try {
      const text = await readFileInputItemText(selectedFile)
      const payload = await loadBackupV1(text, password)
      await importBackup.mutateAsync(payload)
      await waitRemaining(startedAt, importMinimumDurationMs)
      router.replace("/manage-profiles" as Href)
    } catch {
      await waitRemaining(startedAt, importMinimumDurationMs)
      setImportFailed(true)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppBar title={t("importProfile")} />
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

        <Button
          disabled={!canImport}
          isProcessing={isImporting || importBackup.isPending}
          onPress={() => {
            void onImport()
          }}
          style={{ alignSelf: "flex-end" }}
        >
          {t("importProfile")}
        </Button>

        {importFailed ? (
          <ThemedText
            style={{
              ...theme.typography.body.md,
              color: theme.colors.negative.color,
            }}
          >
            {t("migrationBackupLoadedFailure")}
          </ThemedText>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
