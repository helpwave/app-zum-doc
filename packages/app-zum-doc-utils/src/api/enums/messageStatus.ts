const messageStatusValues = ["read", "sent"] as const
export type MessageStatus = (typeof messageStatusValues)[number]
const allowedMessageStatusValues: ReadonlySet<string> = new Set(messageStatusValues)
function isMessageStatusValue(value: unknown): value is MessageStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedMessageStatusValues.has(value)
}
export const MessageStatusUtils = {
  array: messageStatusValues,
  set: allowedMessageStatusValues,
  typeCheck: isMessageStatusValue,
}
