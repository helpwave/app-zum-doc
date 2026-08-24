const userStatusValues = ["online", "offline", "busy", "unknown"] as const
export type UserStatus = (typeof userStatusValues)[number]
const allowedUserStatusValues: ReadonlySet<string> = new Set(userStatusValues)
function isUserStatusValue(value: unknown): value is UserStatus {
  if (typeof value !== "string") {
    return false
  }
  return allowedUserStatusValues.has(value)
}
export const UserStatusUtils = {
  array: userStatusValues,
  set: allowedUserStatusValues,
  typeCheck: isUserStatusValue,
}
