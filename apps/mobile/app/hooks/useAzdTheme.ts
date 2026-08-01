import type { AzdTheme } from "@/theme/azd-theme"
import { useTheme } from "@helpwave/hightide-native/global-contexts"

export function useAzdTheme() {
  return useTheme() as ReturnType<typeof useTheme> & {
    theme: AzdTheme
  }
}
