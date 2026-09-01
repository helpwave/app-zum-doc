import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  resolveCardAction,
  sendMessage
} from "../api/client"
import { conversationKeys, homeKeys } from "./queryKeys"

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.list,
    queryFn: fetchConversations,
  })
}

type UseConversationProps = {
  conversationId: string | null,
  enabled?: boolean,
}

export function useConversation({
  conversationId,
  enabled = true,
}: UseConversationProps) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId ?? ''),
    queryFn: () => fetchConversation(conversationId as string),
    enabled: enabled && conversationId != null && conversationId.length > 0,
  })
}

type UseMessagesProps = {
  conversationId: string | null,
  enabled?: boolean,
}

export function useMessages({ conversationId, enabled = true }: UseMessagesProps) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId as string),
    enabled: enabled && conversationId != null && conversationId.length > 0,
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

type UseSendMessageProps = {
  conversationId: string,
}

export function useSendMessage({ conversationId }: UseSendMessageProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: async (messages) => {
      queryClient.setQueryData(conversationKeys.messages(conversationId), messages)
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

type UseResolveCardActionProps = {
  conversationId: string,
}

export function useResolveCardAction({ conversationId }: UseResolveCardActionProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      actionId,
    }: {
      messageId: string,
      actionId: string,
    }) => resolveCardAction(conversationId, messageId, actionId),
    onSuccess: (messages) => {
      queryClient.setQueryData(conversationKeys.messages(conversationId), messages)
    },
  })
}
