import type { AppLocale } from "@app-zum-doc/utils/api"

export type InsuranceKind = "statutory" | "private"

export type LabeledOption = {
  id: string
  labels: Record<AppLocale, string>
}

export const insuranceProviders: readonly LabeledOption[] = [
  { id: "tk", labels: { "de-DE": "Techniker Krankenkasse", "en-US": "Techniker Krankenkasse" } },
  { id: "aok", labels: { "de-DE": "AOK", "en-US": "AOK" } },
  { id: "barmer", labels: { "de-DE": "Barmer", "en-US": "Barmer" } },
  { id: "dak", labels: { "de-DE": "DAK-Gesundheit", "en-US": "DAK-Gesundheit" } },
  { id: "ikk", labels: { "de-DE": "IKK classic", "en-US": "IKK classic" } },
  { id: "hek", labels: { "de-DE": "HEK", "en-US": "HEK" } },
]

export const federalStates: readonly LabeledOption[] = [
  { id: "baden-wuerttemberg", labels: { "de-DE": "Baden-Württemberg", "en-US": "Baden-Württemberg" } },
  { id: "bayern", labels: { "de-DE": "Bayern", "en-US": "Bavaria" } },
  { id: "berlin", labels: { "de-DE": "Berlin", "en-US": "Berlin" } },
  { id: "brandenburg", labels: { "de-DE": "Brandenburg", "en-US": "Brandenburg" } },
  { id: "bremen", labels: { "de-DE": "Bremen", "en-US": "Bremen" } },
  { id: "hamburg", labels: { "de-DE": "Hamburg", "en-US": "Hamburg" } },
  { id: "hessen", labels: { "de-DE": "Hessen", "en-US": "Hesse" } },
  { id: "mecklenburg-vorpommern", labels: { "de-DE": "Mecklenburg-Vorpommern", "en-US": "Mecklenburg-Western Pomerania" } },
  { id: "niedersachsen", labels: { "de-DE": "Niedersachsen", "en-US": "Lower Saxony" } },
  { id: "nordrhein-westfalen", labels: { "de-DE": "Nordrhein-Westfalen", "en-US": "North Rhine-Westphalia" } },
  { id: "rheinland-pfalz", labels: { "de-DE": "Rheinland-Pfalz", "en-US": "Rhineland-Palatinate" } },
  { id: "saarland", labels: { "de-DE": "Saarland", "en-US": "Saarland" } },
  { id: "sachsen", labels: { "de-DE": "Sachsen", "en-US": "Saxony" } },
  { id: "sachsen-anhalt", labels: { "de-DE": "Sachsen-Anhalt", "en-US": "Saxony-Anhalt" } },
  { id: "schleswig-holstein", labels: { "de-DE": "Schleswig-Holstein", "en-US": "Schleswig-Holstein" } },
  { id: "thueringen", labels: { "de-DE": "Thüringen", "en-US": "Thuringia" } },
]

export function insuranceKindFromType(insuranceType: string): InsuranceKind {
  return insuranceType === "PKV" ? "private" : "statutory"
}

export function toSelectOptions(
  items: readonly LabeledOption[],
  locale: AppLocale,
) {
  return items.map((item) => ({
    id: item.id,
    label: item.labels[locale],
  }))
}
