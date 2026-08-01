export const azdLayout = {
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
    pop: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 2,
    },
    lift: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 3,
    },
    hero: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  font: {
    display: "SpaceGrotesk",
    tabular: "Inter",
  },
} as const
