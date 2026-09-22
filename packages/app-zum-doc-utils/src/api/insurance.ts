import type { InsuranceType } from './enums/insuranceType'

export type InsuranceCompany = {
  id: string,
  type: InsuranceType,
  name: string,
}

export type PatientInsuranceInformation = {
  insuranceProviderId: string,
  insuranceNumber: string,
}

export const insuranceCompanies: InsuranceCompany[] = [
  { id: 'aok-baden-wurttemberg', type: 'public', name: 'AOK Baden-Württemberg' },
  { id: 'aok-bayern', type: 'public', name: 'AOK Bayern' },
  { id: 'aok-bremen-bremerhaven', type: 'public', name: 'AOK Bremen/Bremerhaven' },
  { id: 'aok-hessen', type: 'public', name: 'AOK Hessen' },
  { id: 'aok-niedersachsen', type: 'public', name: 'AOK Niedersachsen' },
  { id: 'aok-nordost', type: 'public', name: 'AOK Nordost' },
  { id: 'aok-nordwest', type: 'public', name: 'AOK Nordwest' },
  { id: 'aok-plus', type: 'public', name: 'AOK Plus' },
  { id: 'aok-rheinland-hamburg', type: 'public', name: 'AOK Rheinland/Hamburg' },
  { id: 'aok-rheinland-pfalz-saarland', type: 'public', name: 'AOK Rheinland-Pfalz/Saarland' },
  { id: 'aok-sachsen-anhalt', type: 'public', name: 'AOK Sachsen-Anhalt' },
  { id: 'barmer', type: 'public', name: 'Barmer' },
  { id: 'dak-gesundheit', type: 'public', name: 'DAK-Gesundheit' },
  { id: 'hek-hanseatische-krankenkasse', type: 'public', name: 'HEK – Hanseatische Krankenkasse' },
  { id: 'hkk-krankenkasse', type: 'public', name: 'hkk Krankenkasse' },
  { id: 'kaufmannische-krankenkasse', type: 'public', name: 'Kaufmännische Krankenkasse' },
  { id: 'techniker-krankenkasse', type: 'public', name: 'Techniker Krankenkasse' },
  { id: 'big-direkt-gesund', type: 'public', name: 'BIG direkt gesund' },
  { id: 'ikk-classic', type: 'public', name: 'IKK classic' },
  { id: 'ikk-gesund-plus', type: 'public', name: 'IKK gesund plus' },
  { id: 'ikk-sudwest', type: 'public', name: 'IKK Südwest' },
  { id: 'ikk-die-innovationskasse', type: 'public', name: 'IKK – Die Innovationskasse' },
  { id: 'ikk-brandenburg-und-berlin', type: 'public', name: 'IKK Brandenburg und Berlin' },
  { id: 'audi-bkk', type: 'public', name: 'Audi BKK' },
  { id: 'bahn-bkk', type: 'public', name: 'Bahn-BKK' },
  { id: 'bergische-krankenkasse', type: 'public', name: 'Bergische Krankenkasse' },
  { id: 'bertelsmann-bkk', type: 'public', name: 'Bertelsmann BKK' },
  { id: 'betriebskrankenkasse-der-bmw-ag', type: 'public', name: 'Betriebskrankenkasse der BMW AG' },
  { id: 'betriebskrankenkasse-der-g-m-pfaff-ag', type: 'public', name: 'Betriebskrankenkasse der G. M. Pfaff AG' },
  { id: 'betriebskrankenkasse-firmus', type: 'public', name: 'Betriebskrankenkasse Firmus' },
  { id: 'betriebskrankenkasse-groz-beckert', type: 'public', name: 'Betriebskrankenkasse Groz-Beckert' },
  { id: 'betriebskrankenkasse-miele', type: 'public', name: 'Betriebskrankenkasse Miele' },
  { id: 'betriebskrankenkasse-mobil', type: 'public', name: 'Betriebskrankenkasse Mobil' },
  { id: 'betriebskrankenkasse-schwarzwald-baar-heuberg', type: 'public', name: 'Betriebskrankenkasse Schwarzwald-Baar-Heuberg' },
  { id: 'betriebskrankenkasse-vereinigte-deutsche-nickel-werke', type: 'public', name: 'Betriebskrankenkasse Vereinigte Deutsche Nickel-Werke' },
  { id: 'betriebskrankenkasse-wmf-wurttembergische-metallwarenfabrik-ag', type: 'public', name: 'Betriebskrankenkasse WMF Württembergische Metallwarenfabrik AG' },
  { id: 'bkk24', type: 'public', name: 'BKK24' },
  { id: 'bkk-b-braun-aesculap', type: 'public', name: 'BKK B. Braun Aesculap' },
  { id: 'bkk-akzo-nobel-bayern', type: 'public', name: 'BKK Akzo Nobel Bayern' },
  { id: 'bkk-deutsche-bank-ag', type: 'public', name: 'BKK Deutsche Bank AG' },
  { id: 'bkk-diakonie', type: 'public', name: 'BKK Diakonie' },
  { id: 'bkk-durkopp-adler', type: 'public', name: 'BKK Dürkopp Adler' },
  { id: 'bkk-euregio', type: 'public', name: 'BKK Euregio' },
  { id: 'bkk-evm', type: 'public', name: 'BKK evm' },
  { id: 'bkk-ewe', type: 'public', name: 'BKK EWE' },
  { id: 'bkk-exklusiv', type: 'public', name: 'BKK exklusiv' },
  { id: 'bkk-faber-castell-partner', type: 'public', name: 'BKK Faber-Castell & Partner' },
  { id: 'bkk-freudenberg', type: 'public', name: 'BKK Freudenberg' },
  { id: 'bkk-gildemeister-seidensticker', type: 'public', name: 'BKK Gildemeister Seidensticker' },
  { id: 'bkk-herkules', type: 'public', name: 'BKK Herkules' },
  { id: 'bkk-linde', type: 'public', name: 'BKK Linde' },
  { id: 'bkk-melitta-hmr', type: 'public', name: 'BKK Melitta HMR' },
  { id: 'bkk-mkk-meine-krankenkasse', type: 'public', name: 'BKK mkk – meine Krankenkasse' },
  { id: 'bkk-mtu', type: 'public', name: 'BKK MTU' },
  { id: 'bkk-pfalz', type: 'public', name: 'BKK Pfalz' },
  { id: 'bkk-provita', type: 'public', name: 'BKK Provita' },
  { id: 'bkk-public', type: 'public', name: 'BKK Public' },
  { id: 'betriebskrankenkasse-pricewaterhousecoopers', type: 'public', name: 'Betriebskrankenkasse PricewaterhouseCoopers' },
  { id: 'bkk-rieker-ricosta-weisser', type: 'public', name: 'BKK Rieker Ricosta Weisser' },
  { id: 'bkk-salzgitter', type: 'public', name: 'BKK Salzgitter' },
  { id: 'bkk-scheufelen', type: 'public', name: 'BKK Scheufelen' },
  { id: 'bkk-technoform', type: 'public', name: 'BKK Technoform' },
  { id: 'bkk-verbundplus', type: 'public', name: 'BKK VerbundPlus' },
  { id: 'bkk-werra-meissner', type: 'public', name: 'BKK Werra-Meissner' },
  { id: 'bkk-wirtschaft-finanzen', type: 'public', name: 'BKK Wirtschaft & Finanzen' },
  { id: 'bkk-wurth', type: 'public', name: 'BKK Würth' },
  { id: 'bosch-bkk', type: 'public', name: 'Bosch BKK' },
  { id: 'continentale-betriebskrankenkasse', type: 'public', name: 'Continentale Betriebskrankenkasse' },
  { id: 'debeka-bkk', type: 'public', name: 'Debeka BKK' },
  { id: 'energie-bkk', type: 'public', name: 'energie-BKK' },
  { id: 'ey-betriebskrankenkasse', type: 'public', name: 'EY Betriebskrankenkasse' },
  { id: 'heimat-krankenkasse', type: 'public', name: 'Heimat Krankenkasse' },
  { id: 'karl-mayer-betriebskrankenkasse', type: 'public', name: 'Karl Mayer Betriebskrankenkasse' },
  { id: 'koenig-bauer-bkk', type: 'public', name: 'Koenig & Bauer BKK' },
  { id: 'krones-betriebskrankenkasse', type: 'public', name: 'Krones Betriebskrankenkasse' },
  { id: 'mahle-betriebskrankenkasse', type: 'public', name: 'Mahle Betriebskrankenkasse' },
  { id: 'mercedes-benz-betriebskrankenkasse', type: 'public', name: 'Mercedes-Benz Betriebskrankenkasse' },
  { id: 'merck-bkk', type: 'public', name: 'Merck BKK' },
  { id: 'mhplus-betriebskrankenkasse', type: 'public', name: 'MHplus Betriebskrankenkasse' },
  { id: 'novitas-bkk', type: 'public', name: 'Novitas BKK' },
  { id: 'pronova-bkk', type: 'public', name: 'Pronova BKK' },
  { id: 'r-v-betriebskrankenkasse', type: 'public', name: 'R+V Betriebskrankenkasse' },
  { id: 'salus-bkk', type: 'public', name: 'Salus BKK' },
  { id: 'securvita-bkk', type: 'public', name: 'Securvita BKK' },
  { id: 'siemens-betriebskrankenkasse', type: 'public', name: 'Siemens-Betriebskrankenkasse' },
  { id: 'skd-bkk', type: 'public', name: 'SKD BKK' },
  { id: 'sudzucker-bkk', type: 'public', name: 'Südzucker BKK' },
  { id: 'tui-bkk', type: 'public', name: 'TUI BKK' },
  { id: 'viactiv-bkk', type: 'public', name: 'Viactiv BKK' },
  { id: 'vivida-bkk', type: 'public', name: 'vivida bkk' },
  { id: 'zf-bkk', type: 'public', name: 'ZF BKK' },
  { id: 'knappschaft', type: 'public', name: 'Knappschaft' },
  { id: 'landwirtschaftliche-krankenkasse', type: 'public', name: 'Landwirtschaftliche Krankenkasse' },
  { id: 'alte-oldenburger-krankenversicherung', type: 'private', name: 'ALTE OLDENBURGER Krankenversicherung' },
  { id: 'allianz-private-krankenversicherung', type: 'private', name: 'Allianz Private Krankenversicherung' },
  { id: 'axa-krankenversicherung', type: 'private', name: 'AXA Krankenversicherung' },
  { id: 'barmenia-krankenversicherung', type: 'private', name: 'Barmenia Krankenversicherung' },
  { id: 'bayerische-beamtenkrankenkasse', type: 'private', name: 'Bayerische Beamtenkrankenkasse' },
  { id: 'concordia-krankenversicherung', type: 'private', name: 'CONCORDIA Krankenversicherung' },
  { id: 'continentale-krankenversicherung', type: 'private', name: 'Continentale Krankenversicherung' },
  { id: 'debeka-krankenversicherung', type: 'private', name: 'Debeka Krankenversicherung' },
  { id: 'devk-krankenversicherung', type: 'private', name: 'DEVK Krankenversicherung' },
  { id: 'dkv-deutsche-krankenversicherung', type: 'private', name: 'DKV Deutsche Krankenversicherung' },
  { id: 'envivas-krankenversicherung', type: 'private', name: 'ENVIVAS Krankenversicherung' },
  { id: 'ergo-krankenversicherung', type: 'private', name: 'ERGO Krankenversicherung' },
  { id: 'generali-krankenversicherung', type: 'private', name: 'Generali Krankenversicherung' },
  { id: 'gothaer-krankenversicherung', type: 'private', name: 'Gothaer Krankenversicherung' },
  { id: 'hallesche-krankenversicherung', type: 'private', name: 'Hallesche Krankenversicherung' },
  { id: 'hansemerkur-krankenversicherung', type: 'private', name: 'HanseMerkur Krankenversicherung' },
  { id: 'hansemerkur-speziale-krankenversicherung', type: 'private', name: 'HanseMerkur Speziale Krankenversicherung' },
  { id: 'huk-coburg-krankenversicherung', type: 'private', name: 'HUK-COBURG-Krankenversicherung' },
  { id: 'landeskrankenhilfe', type: 'private', name: 'Landeskrankenhilfe' },
  { id: 'liga-krankenversicherung', type: 'private', name: 'LIGA Krankenversicherung' },
  { id: 'lvm-krankenversicherung', type: 'private', name: 'LVM Krankenversicherung' },
  { id: 'mecklenburgische-krankenversicherung', type: 'private', name: 'Mecklenburgische Krankenversicherung' },
  { id: 'munchener-verein-krankenversicherung', type: 'private', name: 'Münchener Verein Krankenversicherung' },
  { id: 'nurnberger-krankenversicherung', type: 'private', name: 'NÜRNBERGER Krankenversicherung' },
  { id: 'ottonova-krankenversicherung', type: 'private', name: 'ottonova Krankenversicherung' },
  { id: 'provinzial-krankenversicherung', type: 'private', name: 'Provinzial Krankenversicherung' },
  { id: 'r-v-krankenversicherung', type: 'private', name: 'R+V Krankenversicherung' },
  { id: 'signal-iduna-krankenversicherung', type: 'private', name: 'Signal Iduna Krankenversicherung' },
  { id: 'sono-krankenversicherung', type: 'private', name: 'SONO Krankenversicherung' },
  { id: 'universa-krankenversicherung', type: 'private', name: 'uniVersa Krankenversicherung' },
  { id: 'vigo-krankenversicherung', type: 'private', name: 'vigo Krankenversicherung' },
  { id: 'wurttembergische-krankenversicherung', type: 'private', name: 'Württembergische Krankenversicherung' },
  { id: 'astra-versicherung', type: 'private', name: 'Astra Versicherung' },
  { id: 'ba-die-bayerische-allgemeine-versicherung', type: 'private', name: 'BA die Bayerische Allgemeine Versicherung' },
  { id: 'da-direkt-krankenversicherung', type: 'private', name: 'DA direkt Krankenversicherung' },
  { id: 'dfv-deutsche-familienversicherung', type: 'private', name: 'DFV Deutsche Familienversicherung' },
  { id: 'europa-krankenversicherung', type: 'private', name: 'EUROPA Krankenversicherung' },
  { id: 'ideal-krankenversicherung', type: 'private', name: 'IDEAL Krankenversicherung' },
  { id: 'janitos-krankenversicherung', type: 'private', name: 'Janitos Krankenversicherung' },
  { id: 'wgv-krankenversicherung', type: 'private', name: 'WGV Krankenversicherung' },
  { id: 'wurzburger-versicherung', type: 'private', name: 'Würzburger Versicherung' },
]

export function filterInsuranceCompaniesByType(
  type: InsuranceType
): InsuranceCompany[] {
  return insuranceCompanies.filter((company) => company.type === type)
}

export function findInsuranceCompany(
  insuranceProviderId: string
): InsuranceCompany | undefined {
  return insuranceCompanies.find((company) => company.id === insuranceProviderId)
}

export function insuranceCompanyShortName(
  company: Pick<InsuranceCompany, 'name'>
): string {
  const lower = company.name.toLowerCase()
  if (lower.includes('techniker')) {
    return 'TK'
  }
  if (lower.includes('hkk')) {
    return 'HKK'
  }
  if (lower.startsWith('aok')) {
    return 'AOK'
  }
  if (lower.includes('barmer')) {
    return 'BARMER'
  }
  if (lower.startsWith('dak')) {
    return 'DAK'
  }
  if (lower.includes('debeka')) {
    return 'Debeka'
  }
  if (lower.includes('allianz')) {
    return 'Allianz'
  }
  const first = company.name.split(/[\s–-]/)[0]
  return first ?? company.name
}

export function formatInsuranceChipLabel(
  insurance: PatientInsuranceInformation
): string {
  const company = findInsuranceCompany(insurance.insuranceProviderId)
  const shortName = company ? insuranceCompanyShortName(company) : insurance.insuranceProviderId
  return `${shortName} ${insurance.insuranceNumber}`
}

export function maskInsuranceNumber(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 2) {
    return trimmed
  }
  return `${'\u2217'.repeat(trimmed.length - 2)}${trimmed.slice(-2)}`
}

export function formatInsuranceCompanyWithMaskedNumber(
  insurance: PatientInsuranceInformation
): string | undefined {
  const company = findInsuranceCompany(insurance.insuranceProviderId)
  const number = insurance.insuranceNumber.trim()
  const name = company?.name ?? ''
  if (name.length === 0 && number.length === 0) {
    return undefined
  }
  if (number.length === 0) {
    return name.length > 0 ? name : undefined
  }
  const masked = maskInsuranceNumber(number)
  if (name.length === 0) {
    return `(${masked})`
  }
  return `${name} (${masked})`
}
