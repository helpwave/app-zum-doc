const backupRequestTypes = [
  'appointment',
  'prescription',
  'referral',
  'patientImage',
  'medicationPlan',
  'doctorContact',
] as const

export type BackupRequestType = (typeof backupRequestTypes)[number]

export type AddressJson = {
  street: string,
  postalCode: string,
  city: string,
}

export type DoctorJson = {
  id: number,
  practiceName: string | null,
  firstName: string,
  lastName: string,
  title: string | null,
  address: AddressJson,
}

export type RequestJson = {
  id: number | null,
  doctorName: string,
  title: string,
  requestId: number,
  unread: string,
  requestType: BackupRequestType,
  chatKey: string,
  doctorId: number,
  readToken: string,
  description: string,
  isOpen: boolean,
  lastMessageSyncId: number,
}

export type ChatMessageJson = {
  id: number,
  requestId: number,
  dateCreated: string,
  fromPractice: boolean,
  message: string,
  sender: string,
  unread: boolean,
}

export type ChatJson = {
  doctorId: string,
  messages: ChatMessageJson[],
}

export type MedicationJson = {
  name: string,
  packageSize: string,
}

export type ProfileJson = {
  id: number | null,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  phoneNumber: string,
  insuranceType: string,
  insurance: string,
  federalState: string,
  insuranceNumber: string,
  medications: MedicationJson[],
}

export type BackupData = {
  profile: ProfileJson[],
  doctors: DoctorJson[],
  chats: ChatJson[],
  requests: Record<string, RequestJson[]>,
}

const backupRequestTypeSet: ReadonlySet<string> = new Set(backupRequestTypes)

function invalidBackupData(): never {
  throw new Error('Invalid backup data')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function isNullableInteger(value: unknown): value is number | null {
  return value === null || isInteger(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isBackupRequestType(value: unknown): value is BackupRequestType {
  return isString(value) && backupRequestTypeSet.has(value)
}

function readAddress(value: unknown): AddressJson {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  if (!isString(value['street']) || !isString(value['postalCode']) || !isString(value['city'])) {
    invalidBackupData()
  }
  return {
    street: value['street'],
    postalCode: value['postalCode'],
    city: value['city'],
  }
}

function readMedication(value: unknown): MedicationJson {
  if (!isRecord(value) || !isString(value['name']) || !isString(value['packageSize'])) {
    invalidBackupData()
  }
  return {
    name: value['name'],
    packageSize: value['packageSize'],
  }
}

function readProfile(value: unknown): ProfileJson {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  if (
    !isNullableInteger(value['id'])
    || !isString(value['firstName'])
    || !isString(value['lastName'])
    || !isString(value['dateOfBirth'])
    || !isString(value['phoneNumber'])
    || !isString(value['insuranceType'])
    || !isString(value['insurance'])
    || !isString(value['federalState'])
    || !isString(value['insuranceNumber'])
    || !Array.isArray(value['medications'])
  ) {
    invalidBackupData()
  }
  return {
    id: value['id'],
    firstName: value['firstName'],
    lastName: value['lastName'],
    dateOfBirth: value['dateOfBirth'],
    phoneNumber: value['phoneNumber'],
    insuranceType: value['insuranceType'],
    insurance: value['insurance'],
    federalState: value['federalState'],
    insuranceNumber: value['insuranceNumber'],
    medications: value['medications'].map(readMedication),
  }
}

function readDoctor(value: unknown): DoctorJson {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  if (
    !isInteger(value['id'])
    || !isNullableString(value['practiceName'])
    || !isString(value['firstName'])
    || !isString(value['lastName'])
    || !isNullableString(value['title'])
  ) {
    invalidBackupData()
  }
  return {
    id: value['id'],
    practiceName: value['practiceName'],
    firstName: value['firstName'],
    lastName: value['lastName'],
    title: value['title'],
    address: readAddress(value['address']),
  }
}

function readChatMessage(value: unknown): ChatMessageJson {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  if (
    !isInteger(value['id'])
    || !isInteger(value['requestId'])
    || !isString(value['dateCreated'])
    || !isBoolean(value['fromPractice'])
    || !isString(value['message'])
    || !isString(value['sender'])
    || !isBoolean(value['unread'])
  ) {
    invalidBackupData()
  }
  return {
    id: value['id'],
    requestId: value['requestId'],
    dateCreated: value['dateCreated'],
    fromPractice: value['fromPractice'],
    message: value['message'],
    sender: value['sender'],
    unread: value['unread'],
  }
}

function readChat(value: unknown): ChatJson {
  if (!isRecord(value) || !isString(value['doctorId']) || !Array.isArray(value['messages'])) {
    invalidBackupData()
  }
  return {
    doctorId: value['doctorId'],
    messages: value['messages'].map(readChatMessage),
  }
}

function readRequest(value: unknown): RequestJson {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  if (
    !isNullableInteger(value['id'])
    || !isString(value['doctorName'])
    || !isString(value['title'])
    || !isInteger(value['requestId'])
    || !isString(value['unread'])
    || !isBackupRequestType(value['requestType'])
    || !isString(value['chatKey'])
    || !isInteger(value['doctorId'])
    || !isString(value['readToken'])
    || !isString(value['description'])
    || !isBoolean(value['isOpen'])
    || !isInteger(value['lastMessageSyncId'])
  ) {
    invalidBackupData()
  }
  return {
    id: value['id'],
    doctorName: value['doctorName'],
    title: value['title'],
    requestId: value['requestId'],
    unread: value['unread'],
    requestType: value['requestType'],
    chatKey: value['chatKey'],
    doctorId: value['doctorId'],
    readToken: value['readToken'],
    description: value['description'],
    isOpen: value['isOpen'],
    lastMessageSyncId: value['lastMessageSyncId'],
  }
}

function readRequests(value: unknown): Record<string, RequestJson[]> {
  if (!isRecord(value)) {
    invalidBackupData()
  }
  const requests: Record<string, RequestJson[]> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (!Array.isArray(entry)) {
      invalidBackupData()
    }
    requests[key] = entry.map(readRequest)
  }
  return requests
}

export function parseBackupDataV1(payload: string): BackupData {
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    invalidBackupData()
  }
  if (
    !isRecord(parsed)
    || !Array.isArray(parsed['profile'])
    || !Array.isArray(parsed['doctors'])
    || !Array.isArray(parsed['chats'])
  ) {
    invalidBackupData()
  }
  return {
    profile: parsed['profile'].map(readProfile),
    doctors: parsed['doctors'].map(readDoctor),
    chats: parsed['chats'].map(readChat),
    requests: readRequests(parsed['requests']),
  }
}
