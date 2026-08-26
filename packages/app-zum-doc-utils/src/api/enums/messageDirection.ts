const messageDirectionValues = ["incoming", "outgoing"] as const
export type MessageDirection = (typeof messageDirectionValues)[number]
const allowedMessageDirectionValues: ReadonlySet<string> = new Set(
  messageDirectionValues,
)
function isMessageDirectionValue(value: unknown): value is MessageDirection {
  if (typeof value !== "string") {
    return false
  }
  return allowedMessageDirectionValues.has(value)
}
export const MessageDirectionUtils = {
  array: messageDirectionValues,
  set: allowedMessageDirectionValues,
  typeCheck: isMessageDirectionValue,
}
