import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ConversationPreview, Message } from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { conversationKeys, homeKeys } from './queryKeys'

export function useConversations(
  options: QueryHookOptions<undefined, ConversationPreview[]> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: conversationKeys.list,
    queryFn: client.fetchConversations,
  })
}

type UseConversationParameters = {
  conversationId: string,
}
type UseConversationProps = QueryHookOptions<UseConversationParameters, ConversationPreview>

export function useConversation({
  parameters,
  enabled,
  ...options
}: UseConversationProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: conversationKeys.detail(parameters),
    queryFn: () => client.fetchConversation(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type UseMessagesParameters = {
  conversationId: string,
}
type UseMessagesProps = QueryHookOptions<UseMessagesParameters, Message[]>

export function useMessages({
  parameters,
  enabled,
  ...options
}: UseMessagesProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: conversationKeys.messages(parameters),
    queryFn: () => client.fetchMessages(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

export function useMarkConversationRead(
  options: MutationHookOptions<ConversationPreview[], string> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (conversationId: string) => client.markConversationRead(conversationId),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type UseSendMessageProps = {
  conversationId: string,
} & MutationHookOptions<Message[], string>

export function useSendMessage({
  conversationId,
  ...options
}: UseSendMessageProps) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (body: string) => client.sendMessage(conversationId, body),
    onSuccess: async (...args) => {
      const [messages] = args
      queryClient.setQueryData(conversationKeys.messages({ conversationId }), messages)
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type ResolveCardActionVariables = {
  messageId: string,
  actionId: string,
}

type UseResolveCardActionProps = {
  conversationId: string,
} & MutationHookOptions<Message[], ResolveCardActionVariables>

export function useResolveCardAction({
  conversationId,
  ...options
}: UseResolveCardActionProps) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ messageId, actionId }: ResolveCardActionVariables) =>
      client.resolveCardAction(conversationId, messageId, actionId),
    onSuccess: (...args) => {
      const [messages] = args
      queryClient.setQueryData(conversationKeys.messages({ conversationId }), messages)
      return onSuccess?.(...args)
    },
  })
}
