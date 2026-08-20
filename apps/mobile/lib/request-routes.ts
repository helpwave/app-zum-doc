import type { HomeRequest } from "@app-zum-doc/utils/api"
import type { Href } from "expo-router"

export function hrefForRequest(request: Pick<HomeRequest, "id" | "kind">): Href {
  if (request.kind === "appointment") {
    return {
      pathname: "/requests/appointment/[id]",
      params: { id: request.id },
    }
  }

  return {
    pathname: "/requests/[id]",
    params: { id: request.id },
  }
}
