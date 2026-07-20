export const azd = {
  green: {
    900: "#095763",
    700: "#0C725F",
    600: "#057986",
    500: "#4E97A2",
    400: "#519B89",
    300: "#509993",
    200: "#9DBCC1",
    100: "#C0DBD6",
  },
  navy: {
    900: "#112233",
    700: "#243558",
    500: "#1F3052",
    300: "#4D566A",
    100: "#B7C5E1",
    bg: "#F5F6FF",
    avatarBg: "#E3EAF5",
  },
  softGreen: {
    bg: "#DCEDE9",
  },
  fg: {
    1: "#1A1A1A",
    2: "#333333",
    3: "#4D4D4D",
    4: "#666666",
    5: "#888888",
    6: "#919191",
    7: "#B3B3B3",
    8: "#ADADAD",
  },
  bg: {
    app: "#F2F2F7",
    portal: "#F8F8F8",
    surface: "#FFFFFF",
    surface2: "#FAFAFA",
  },
  divider: "#E6E6E6",
  border: "#E8E8E8",
  semantic: {
    success: "#057986",
    warning: "#C9A227",
    warningBg: "#FBF3D9",
    danger: "#C0392B",
    dangerBg: "rgba(192,57,43,0.08)",
    info: "#4993C5",
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999,
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
  },
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 20,
      elevation: 1,
    },
  },
  font: {
    display: "SpaceGrotesk",
    tabular: "Inter",
  },
} as const

export const avatarPalettes = [
  { background: azd.green[100], foreground: azd.green[600] },
  { background: azd.navy.avatarBg, foreground: azd.navy[700] },
  { background: azd.softGreen.bg, foreground: azd.green[700] },
  { background: azd.divider, foreground: azd.fg[4] },
] as const

export function initialsFromName(name: string): string {
  const parts = name
    .replace(/Dr\.\s*med\.\s*/i, "")
    .replace(/Dr\.\s*/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function avatarPaletteForId(id: string) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index) * (index + 1)) % avatarPalettes.length
  }
  return avatarPalettes[hash]
}
