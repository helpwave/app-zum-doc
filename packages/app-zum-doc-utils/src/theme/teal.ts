export const tealPalette = {
  type: "basic" as const,
  value: {
    50: "#E8F5F4",
    100: "#C0DBD6",
    200: "#9DBCC1",
    300: "#509993",
    400: "#519B89",
    500: "#4E97A2",
    600: "#057986",
    700: "#0C725F",
    800: "#0A5F55",
    900: "#095763",
    950: "#05353C",
  } as const satisfies Record<number, `#${string}`>,
}
