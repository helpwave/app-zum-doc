import type { AppOnboardingProfileInput, ProfileJson } from "@app-zum-doc/utils/api"

export function onboardingProfileFromBackup(
  profile: ProfileJson,
  index: number,
): AppOnboardingProfileInput {
  return {
    id: profile.id == null ? `imported-${index}` : String(profile.id),
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
    phoneNumber: profile.phoneNumber,
    email: "",
    insurance: profile.insurance,
    insuranceNumber: profile.insuranceNumber,
    medications: profile.medications.map((item) => ({
      name: item.name,
      packageSize: item.packageSize,
    })),
  }
}
