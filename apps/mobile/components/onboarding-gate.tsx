import { LoadingView } from "@/components/loading-view"
import { OnboardingBackupLoad } from "@/components/onboarding-backup-load"
import { OnboardingBackupPick } from "@/components/onboarding-backup-pick"
import { onboardingProfileFromBackup } from "@/components/onboarding-backup-profile"
import { OnboardingBackupSummary } from "@/components/onboarding-backup-summary"
import { OnboardingMainProfile } from "@/components/onboarding-main-profile"
import { OnboardingProfiles } from "@/components/onboarding-profiles"
import { OnboardingWelcome } from "@/components/onboarding-welcome"
import { QueryState } from "@/components/query-state"
import {
  emptyProfileFormValues,
  type ProfileFormValues,
} from "@/components/profile-form-fields"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import type {
  AppOnboardingProfileInput,
  BackupData,
  ChatJson,
  DoctorJson,
  RequestJson,
} from "@app-zum-doc/utils/api"
import {
  useCompleteAppOnboarding,
  useMarkAppOnboarded,
  useOnboardingInformation,
} from "@app-zum-doc/utils/hooks"
import { useState, type ReactNode } from "react"

type OnboardingStep = "welcome" | "main" | "managed" | "backupLoad" | "backupSummary" | "backupPick" | "backupCreate"

type ManagedOrigin = "main" | "backupPick" | "backupCreate"

type LoadedBackup = {
  profiles: AppOnboardingProfileInput[]
  doctors: DoctorJson[]
  chats: ChatJson[]
  requests: RequestJson[]
}

type OnboardingGateProps = {
  children: ReactNode
}

function mainProfileFromForm(values: ProfileFormValues): AppOnboardingProfileInput {
  return {
    id: "main-profile",
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dateOfBirth: values.dateOfBirth,
    phoneNumber: values.phone.trim(),
    email: values.email.trim(),
    insurance: values.insuranceProviderId ?? "",
    insuranceNumber: values.insuranceNumber.trim(),
    medications: [],
  }
}

function loadedBackupFromData(backup: BackupData): LoadedBackup {
  return {
    profiles: backup.profile.map((profile, index) => onboardingProfileFromBackup(profile, index)),
    doctors: backup.doctors,
    chats: backup.chats,
    requests: Object.values(backup.requests).flat(),
  }
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const t = useAppTranslation()
  const onboardingQuery = useOnboardingInformation()
  const markOnboarded = useMarkAppOnboarded()
  const completeOnboarding = useCompleteAppOnboarding()
  const [step, setStep] = useState<OnboardingStep>("welcome")
  const [mainForm, setMainForm] = useState<ProfileFormValues>(emptyProfileFormValues)
  const [mainProfile, setMainProfile] = useState<AppOnboardingProfileInput | null>(null)
  const [managedProfiles, setManagedProfiles] = useState<AppOnboardingProfileInput[]>([])
  const [manualManagedProfiles, setManualManagedProfiles] = useState<AppOnboardingProfileInput[]>([])
  const [managedOrigin, setManagedOrigin] = useState<ManagedOrigin>("main")
  const [loadedBackup, setLoadedBackup] = useState<LoadedBackup | null>(null)

  const finish = (profiles: AppOnboardingProfileInput[]) => {
    if (mainProfile == null) {
      return
    }
    void completeOnboarding.mutateAsync({
      mainProfile,
      managedProfiles: profiles,
    })
  }

  const openManaged = (
    origin: ManagedOrigin,
    nextMain: AppOnboardingProfileInput,
    nextManaged: AppOnboardingProfileInput[],
  ) => {
    setMainProfile(nextMain)
    setManagedProfiles(nextManaged)
    setManagedOrigin(origin)
    setStep("managed")
  }

  return (
    <QueryState
      isPending={onboardingQuery.isPending}
      isError={onboardingQuery.isError}
      error={onboardingQuery.error}
      onRetry={() => {
        void onboardingQuery.refetch()
      }}
      loadingLabel={t("loadingProfile")}
    >
      {onboardingQuery.data == null || onboardingQuery.isPending ? (
        <LoadingView />
      ) : onboardingQuery.data.hasOnboarded ? (
        children
      ) : step === "main" ? (
        <OnboardingMainProfile
          values={mainForm}
          onChange={setMainForm}
          onBack={() => {
            setStep("welcome")
          }}
          onContinue={() => {
            openManaged("main", mainProfileFromForm(mainForm), manualManagedProfiles)
          }}
          onRestoreBackup={() => {
            setManualManagedProfiles(managedProfiles)
            setStep("backupLoad")
          }}
        />
      ) : step === "backupLoad" ? (
        <OnboardingBackupLoad
          onBack={() => {
            setManagedProfiles(manualManagedProfiles)
            setStep("main")
          }}
          onLoaded={(backup) => {
            setLoadedBackup(loadedBackupFromData(backup))
            setStep("backupSummary")
          }}
        />
      ) : step === "backupSummary" && loadedBackup != null ? (
        <OnboardingBackupSummary
          profiles={loadedBackup.profiles}
          doctors={loadedBackup.doctors}
          chats={loadedBackup.chats}
          requests={loadedBackup.requests}
          onBack={() => {
            setStep("backupLoad")
          }}
          onContinue={() => {
            setStep("backupPick")
          }}
        />
      ) : step === "backupPick" && loadedBackup != null ? (
        <OnboardingBackupPick
          profiles={loadedBackup.profiles}
          onBack={() => {
            setStep("backupSummary")
          }}
          onContinue={(choice) => {
            if (choice === "new") {
              setStep("backupCreate")
              return
            }
            const selected = loadedBackup.profiles.find((profile) => profile.id === choice)
            if (selected == null) {
              return
            }
            openManaged(
              "backupPick",
              selected,
              loadedBackup.profiles.filter((profile) => profile.id !== selected.id),
            )
          }}
        />
      ) : step === "backupCreate" && loadedBackup != null ? (
        <OnboardingMainProfile
          values={mainForm}
          onChange={setMainForm}
          onBack={() => {
            setStep("backupPick")
          }}
          onContinue={() => {
            openManaged("backupCreate", mainProfileFromForm(mainForm), loadedBackup.profiles)
          }}
        />
      ) : step === "managed" ? (
        <OnboardingProfiles
          profiles={managedProfiles}
          isFinishing={completeOnboarding.isPending}
          onProfilesChange={(profiles) => {
            setManagedProfiles(profiles)
            if (managedOrigin === "main") {
              setManualManagedProfiles(profiles)
            }
          }}
          onBack={() => {
            if (managedOrigin === "backupCreate") {
              setStep("backupCreate")
              return
            }
            if (managedOrigin === "backupPick") {
              setStep("backupPick")
              return
            }
            setStep("main")
          }}
          onSkip={() => {
            finish([])
          }}
          onFinish={() => {
            finish(managedProfiles)
          }}
        />
      ) : (
        <OnboardingWelcome
          isContinuing={markOnboarded.isPending}
          onNext={() => {
            if (onboardingQuery.data?.mainProfile != null) {
              void markOnboarded.mutateAsync()
              return
            }
            setStep("main")
          }}
        />
      )}
    </QueryState>
  )
}
