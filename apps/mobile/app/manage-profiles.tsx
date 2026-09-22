import { AppBar } from "@/components/app-bar"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  formatPatientDateOfBirth,
  patientProfileFullName,
  toAppLocale,
  type PatientProfileSummary,
} from "@app-zum-doc/utils/api"
import {
  useDeletePatientProfile,
  usePatientProfiles,
} from "@app-zum-doc/utils/hooks"
import {
  Card,
  IconButton,
  ListActionItem,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter, type Href } from "expo-router"
import { CirclePlus, Download, Trash, User } from "lucide-react-native"
import { useState } from "react"
import { ScrollView, View } from "react-native"

export default function ManageProfilesScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const profilesQuery = usePatientProfiles()
  const deleteProfile = useDeletePatientProfile()
  const [profileToDelete, setProfileToDelete] = useState<PatientProfileSummary>()

  const profiles = profilesQuery.data ?? []

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("manageProfiles")} />
      <QueryState
        isPending={profilesQuery.isPending}
        isError={profilesQuery.isError}
        error={profilesQuery.error}
        onRetry={() => {
          void profilesQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <ListActionItem
              title={t("createProfile")}
              color={theme.colors.primary}
              leading={<ThemedIcon icon={CirclePlus} />}
              titleStyle={{
                fontWeight: theme.fontWeights.semibold,
              }}
              onPress={() => {
                router.push("/create-profile" as Href)
              }}
            />
          </Card>
          <Card>
            <ListActionItem
              title={t("importProfiles")}
              color={theme.colors.primary}
              leading={<ThemedIcon icon={Download} />}
              titleStyle={{
                fontWeight: theme.fontWeights.semibold,
              }}
              onPress={() => {
                router.push("/migration" as Href)
              }}
            />
          </Card>

          {profiles.length === 0 ? (
            <ThemedText appearance="description" style={theme.typography.body.md}>
              {t("noManagedProfiles")}
            </ThemedText>
          ) : null}

          {profiles.map((profile) => (
            <Card key={profile.id}>
              <ListActionItem
                title={patientProfileFullName(profile)}
                subtitle={formatPatientDateOfBirth(profile.dateOfBirth, locale)}
                leading={
                  <ThemedIcon
                    icon={User}
                    color={theme.colors.primary.color}
                  />
                }
                trailing={
                  <IconButton
                    icon={Trash}
                    size="sm"
                    variant="foreground"
                    color={{ color: theme.colors.surface.onColor, onColor: theme.colors.surface.color }}
                    accessibilityLabel={t("deleteProfile")}
                    isProcessing={
                      deleteProfile.isPending
                      && deleteProfile.variables === profile.id
                    }
                    disabled={
                      deleteProfile.isPending
                      && deleteProfile.variables !== profile.id
                    }
                    onPress={() => {
                      setProfileToDelete(profile)
                    }}
                  />
                }
              />
            </Card>
          ))}
        </ScrollView>
      </QueryState>
      <ConfirmationModal
        isOpen={profileToDelete != null}
        onIsOpenChange={(isOpen) => {
          if (!isOpen) {
            setProfileToDelete(undefined)
          }
        }}
        title={t("deleteProfileTitle")}
        message={
          profileToDelete == null
            ? ""
            : t("deleteProfileConfirm", { name: patientProfileFullName(profileToDelete) })
        }
        confirmLabel={t("deleteProfile")}
        cancelLabel={t("cancel")}
        confirmColor={theme.colors.negative}
        onConfirm={() => {
          if (profileToDelete == null) {
            return
          }
          void deleteProfile.mutateAsync(profileToDelete.id)
        }}
      />
    </View>
  )
}
