const chatMessageTypeValues = [
  "text",
  "date",
  "system",
  "card",
  "attachment",
] as const
export type ChatMessageType = (typeof chatMessageTypeValues)[number]
const allowedChatMessageTypeValues: ReadonlySet<string> = new Set(chatMessageTypeValues)
function isChatMessageTypeValue(value: unknown): value is ChatMessageType {
  if (typeof value !== "string") {
    return false
  }
  return allowedChatMessageTypeValues.has(value)
}
export const ChatMessageTypeUtils = {
  array: chatMessageTypeValues,
  set: allowedChatMessageTypeValues,
  typeCheck: isChatMessageTypeValue,
}
