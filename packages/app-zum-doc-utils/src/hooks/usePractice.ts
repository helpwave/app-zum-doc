import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchPracticeConversation,
  fetchPracticeConversations,
  fetchPracticeMessages,
  fetchPracticeOverview,
  fetchPracticePatients,
  fetchPracticeRequest,
  fetchPracticeRequests,
  markPracticeConversationRead,
  sendPracticeMessage,
  updateDoctorsOffice,
  updatePatientRequestStatus
} from '../api/client'
import type {
  AppLocale,
  ConversationPreview,
  DoctorsOffice,
  Message,
  PatientProfile,
  PatientRequestStatus,
  PatientRequestType,
  PracticeOverview,
  PracticeRequest,
  UpdateDoctorsOfficeInput
} from '../api/types'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import {
  appointmentKeys,
  doctorsOfficeKeys,
  homeKeys,
  practiceConversationKeys,
  practiceKeys,
  prescriptionKeys,
  referralKeys
} from './queryKeys'

type UsePracticeOverviewParameters = {
  officeId: string,
  locale: AppLocale,
}
type UsePracticeOverviewProps = QueryHookOptions<
  UsePracticeOverviewParameters,
  PracticeOverview
>

export function usePracticeOverview({
  parameters,
  ...options
}: UsePracticeOverviewProps) {
  return useQuery({
    ...options,
    queryKey: practiceKeys.overview(parameters),
    queryFn: () => fetchPracticeOverview(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      options.enabled
    ),
  })
}

export function usePracticePatients(
  options: QueryHookOptions<undefined, PatientProfile[]> = {}
) {
  return useQuery({
    ...options,
    queryKey: practiceKeys.patients,
    queryFn: fetchPracticePatients,
  })
}

type UsePracticeRequestsParameters = {
  officeId: string,
  locale: AppLocale,
  kind?: PatientRequestType,
  status?: PatientRequestStatus,
}
type UsePracticeRequestsProps = QueryHookOptions<
  UsePracticeRequestsParameters,
  PracticeRequest[]
>

export function usePracticeRequests({
  parameters,
  ...options
}: UsePracticeRequestsProps) {
  return useQuery({
    ...options,
    queryKey: practiceKeys.requests(parameters),
    queryFn: () => fetchPracticeRequests(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      options.enabled
    ),
  })
}

type UsePracticeRequestParameters = {
  id: string,
  locale: AppLocale,
}
type UsePracticeRequestProps = QueryHookOptions<
  UsePracticeRequestParameters,
  PracticeRequest
>

export function usePracticeRequest({
  parameters,
  enabled,
  ...options
}: UsePracticeRequestProps) {
  return useQuery({
    ...options,
    queryKey: practiceKeys.request(parameters),
    queryFn: () => fetchPracticeRequest(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type UpdatePatientRequestStatusVariables = {
  id: string,
  kind: PatientRequestType,
  status: PatientRequestStatus,
  locale: AppLocale,
}

export function useUpdatePatientRequestStatus(
  options: MutationHookOptions<
    PracticeRequest,
    UpdatePatientRequestStatusVariables
  > = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (variables: UpdatePatientRequestStatusVariables) =>
      updatePatientRequestStatus(variables),
    onSuccess: async (...args) => {
      const [request, { locale }] = args
      queryClient.setQueryData(
        practiceKeys.request({ id: request.id, locale }),
        request
      )
      if (request.kind === 'appointment') {
        queryClient.setQueryData(
          appointmentKeys.detail({ id: request.id, locale }),
          request
        )
      }
      if (request.kind === 'prescription') {
        queryClient.setQueryData(
          prescriptionKeys.detail({ id: request.id, locale }),
          request
        )
      }
      if (request.kind === 'referral') {
        queryClient.setQueryData(
          referralKeys.detail({ id: request.id, locale }),
          request
        )
      }
      await queryClient.invalidateQueries({ queryKey: practiceKeys.all })
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type UpdateDoctorsOfficeVariables = {
  officeId: string,
  locale: AppLocale,
  input: UpdateDoctorsOfficeInput,
}

export function useUpdateDoctorsOffice(
  options: MutationHookOptions<DoctorsOffice, UpdateDoctorsOfficeVariables> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (variables: UpdateDoctorsOfficeVariables) =>
      updateDoctorsOffice(variables),
    onSuccess: async (...args) => {
      const [office, { officeId, locale }] = args
      queryClient.setQueryData(
        doctorsOfficeKeys.detail({ id: officeId, locale }),
        office
      )
      await queryClient.invalidateQueries({ queryKey: practiceKeys.all })
      await onSuccess?.(...args)
    },
  })
}

export function usePracticeConversations(
  options: QueryHookOptions<undefined, ConversationPreview[]> = {}
) {
  return useQuery({
    ...options,
    queryKey: practiceConversationKeys.list,
    queryFn: fetchPracticeConversations,
  })
}

type UsePracticeConversationParameters = {
  conversationId: string,
}
type UsePracticeConversationProps = QueryHookOptions<
  UsePracticeConversationParameters,
  ConversationPreview
>

export function usePracticeConversation({
  parameters,
  enabled,
  ...options
}: UsePracticeConversationProps) {
  return useQuery({
    ...options,
    queryKey: practiceConversationKeys.detail(parameters),
    queryFn: () => fetchPracticeConversation(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type UsePracticeMessagesParameters = {
  conversationId: string,
}
type UsePracticeMessagesProps = QueryHookOptions<
  UsePracticeMessagesParameters,
  Message[]
>

export function usePracticeMessages({
  parameters,
  enabled,
  ...options
}: UsePracticeMessagesProps) {
  return useQuery({
    ...options,
    queryKey: practiceConversationKeys.messages(parameters),
    queryFn: () => fetchPracticeMessages(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

export function useMarkPracticeConversationRead(
  options: MutationHookOptions<ConversationPreview[], string> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (conversationId: string) =>
      markPracticeConversationRead(conversationId),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: practiceConversationKeys.all,
      })
      await onSuccess?.(...args)
    },
  })
}

type UseSendPracticeMessageProps = {
  conversationId: string,
} & MutationHookOptions<Message[], string>

export function useSendPracticeMessage({
  conversationId,
  ...options
}: UseSendPracticeMessageProps) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (body: string) => sendPracticeMessage(conversationId, body),
    onSuccess: async (...args) => {
      const [messages] = args
      queryClient.setQueryData(
        practiceConversationKeys.messages({ conversationId }),
        messages
      )
      await queryClient.invalidateQueries({
        queryKey: practiceConversationKeys.all,
      })
      await onSuccess?.(...args)
    },
  })
}
