import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  resolveCardAction,
  sendMessage,
} from "@/api/mock/client"

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (search?: string) => ["conversations", "list", search ?? ""] as const,
  detail: (id: string) => ["conversations", "detail", id] as const,
  messages: (id: string) => ["conversations", "messages", id] as const,
}

export function useConversations(search?: string) {
  return useQuery({
    queryKey: conversationKeys.list(search),
    queryFn: () => fetchConversations(search),
  })
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: () => fetchConversation(conversationId),
    enabled: conversationId.length > 0,
  })
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: conversationId.length > 0,
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["home"] })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: async (messages) => {
      queryClient.setQueryData(conversationKeys.messages(conversationId), messages)
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["home"] })
    },
  })
}

export function useResolveCardAction(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      actionId,
    }: {
      messageId: string
      actionId: string
    }) => resolveCardAction(conversationId, messageId, actionId),
    onSuccess: (messages) => {
      queryClient.setQueryData(conversationKeys.messages(conversationId), messages)
    },
  })
}
