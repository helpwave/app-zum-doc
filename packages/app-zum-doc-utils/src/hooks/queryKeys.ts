export const conversationKeys = {
  all: ['conversations'] as const,
  list: ['conversations', 'list'] as const,
  detail: (params?: { conversationId: string }) => ['conversations', 'detail', params?.conversationId ?? ''] as const,
  messages: (params?: { conversationId: string }) => ['conversations', 'messages', params?.conversationId ?? ''] as const,
}

export const myDoctorsKeys = {
  all: ['myDoctors'] as const,
}

export const homeKeys = {
  all: ['home'] as const,
  summary: (params?: { locale: string }) => ['home', 'summary', params?.locale ?? ''] as const,
}

export const profileKeys = {
  all: ['profile'] as const,
  patient: ['profile', 'patient'] as const,
  byId: (params?: { profileId: string }) => ['profile', 'detail', params?.profileId ?? ''] as const,
}

export const doctorsOfficeKeys = {
  all: ['doctorsOffice'] as const,
  detail: (params?: { id: string, locale: string }) =>
    ['doctorsOffice', 'detail', params?.id ?? '', params?.locale ?? ''] as const,
}

export const doctorSearchKeys = {
  all: ['doctorSearch'] as const,
  list: (filters?: {
    query?: string,
    cityId?: string,
    specializationId?: string,
    locale: string,
  }) =>
    [
      'doctorSearch',
      'list',
      filters?.locale,
      filters?.query ?? '',
      filters?.cityId ?? '',
      filters?.specializationId ?? '',
    ] as const,
}

export const cityKeys = {
  all: ['cities'] as const,
  list: (params?: { search: string, locale: string }) =>
    ['cities', 'list', params?.locale ?? '', params?.search ?? ''] as const,
}

export const specializationKeys = {
  all: ['specializations'] as const,
  list: (params?: { search: string, locale: string }) =>
    ['specializations', 'list', params?.locale ?? '', params?.search ?? ''] as const,
}

export const medicationKeys = {
  all: ['medications'] as const,
  patient: ['medications', 'patient'] as const,
  search: (params?: { search: string }) => ['medications', 'search', params?.search ?? ''] as const,
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  detail: (params?: { id: string, locale: string }) =>
    ['appointments', 'detail', params?.id ?? '', params?.locale ?? ''] as const,
}

export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  detail: (params?: { id: string, locale: string }) =>
    ['prescriptions', 'detail', params?.id ?? '', params?.locale ?? ''] as const,
}

export const referralKeys = {
  all: ['referrals'] as const,
  detail: (params?: { id: string, locale: string }) =>
    ['referrals', 'detail', params?.id ?? '', params?.locale ?? ''] as const,
}

export const profileListKeys = {
  all: ['profiles'] as const,
  list: ['profiles', 'list'] as const,
}

export const practiceKeys = {
  all: ['practice'] as const,
  office: (params?: { officeId: string, locale: string }) =>
    ['practice', 'office', params?.officeId ?? '', params?.locale ?? ''] as const,
  overview: (params?: { officeId: string, locale: string }) =>
    ['practice', 'overview', params?.officeId ?? '', params?.locale ?? ''] as const,
  requests: (params?: {
    officeId: string,
    locale: string,
    kind?: string,
    status?: string,
  }) =>
    [
      'practice',
      'requests',
      params?.officeId ?? '',
      params?.locale ?? '',
      params?.kind ?? '',
      params?.status ?? '',
    ] as const,
  request: (params?: { id: string, locale: string }) =>
    ['practice', 'request', params?.id ?? '', params?.locale ?? ''] as const,
  patients: ['practice', 'patients'] as const,
}

export const practiceConversationKeys = {
  all: ['practiceConversations'] as const,
  list: ['practiceConversations', 'list'] as const,
  detail: (params?: { conversationId: string }) =>
    ['practiceConversations', 'detail', params?.conversationId ?? ''] as const,
  messages: (params?: { conversationId: string }) =>
    ['practiceConversations', 'messages', params?.conversationId ?? ''] as const,
}

export const onboardingKeys = {
  all: ['onboarding'] as const,
  information: ['onboarding', 'information'] as const,
  status: ['onboarding', 'status'] as const,
  myData: ['onboarding', 'myData'] as const,
  encryption: ['onboarding', 'encryption'] as const,
}
