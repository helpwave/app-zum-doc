import type { RequestBase } from "@app-zum-doc/utils/api"
import type { Href } from "expo-router"

export function hrefForRequest(request: Pick<RequestBase, "id" | "kind">): Href {
  if (request.kind === "appointment") {
    return {
      pathname: "/requests/appointment/[id]",
      params: { id: request.id },
    }
  }
  if (request.kind === "prescription") {
    return {
      pathname: "/requests/prescription/[id]",
      params: { id: request.id },
    }
  }
  if (request.kind === "referral") {
    return {
      pathname: "/requests/referral/[id]",
      params: { id: request.id },
    }
  }

  return {
    pathname: "/requests/[id]",
    params: { id: request.id },
  }
}
