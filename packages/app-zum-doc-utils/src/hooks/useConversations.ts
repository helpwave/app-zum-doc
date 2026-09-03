import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  resolveCardAction,
  sendMessage
} from '../api/client'
import type { ConversationPreview, Message } from '../api/types'
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
  return useQuery({
    ...options,
    queryKey: conversationKeys.list,
    queryFn: fetchConversations,
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
  return useQuery({
    ...options,
    queryKey: conversationKeys.detail(parameters),
    queryFn: () => fetchConversation(assertNotUndefined(parameters)),
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
  return useQuery({
    ...options,
    queryKey: conversationKeys.messages(parameters),
    queryFn: () => fetchMessages(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

export function useMarkConversationRead(
  options: MutationHookOptions<ConversationPreview[], string> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (body: string) => sendMessage(conversationId, body),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ messageId, actionId }: ResolveCardActionVariables) =>
      resolveCardAction(conversationId, messageId, actionId),
    onSuccess: (...args) => {
      const [messages] = args
      queryClient.setQueryData(conversationKeys.messages({ conversationId }), messages)
      return onSuccess?.(...args)
    },
  })
}
