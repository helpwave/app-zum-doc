import { Button } from "@helpwave/hightide-native/components"
import { CalendarDays } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"
import type { StructuredCardMessage } from "@/api/mock/types"

type StructuredCardProps = {
  message: StructuredCardMessage
  onAction?: (actionId: string) => void
  isActionPending?: boolean
}

export function StructuredCard({
  message,
  onAction,
  isActionPending = false,
}: StructuredCardProps) {
  return (
    <View
      style={[
        styles.card,
        message.direction === "outgoing" ? styles.alignEnd : styles.alignStart,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconTile}>
          <CalendarDays size={20} color={azd.green[600]} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.subtitle}>{message.subtitle}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.primary}>{message.primary}</Text>
        <Text style={styles.detail}>{message.detail}</Text>
      </View>
      {message.actions && message.actions.length > 0 ? (
        <View style={styles.actions}>
          {message.actions.map((action) => (
            <Button
              key={action.id}
              disabled={isActionPending}
              onPress={() => onAction?.(action.id)}
              style={styles.actionButton}
              buttonStyle={() =>
                action.variant === "primary"
                  ? {
                      backgroundColor: azd.green[600],
                      borderRadius: azd.radius.pill,
                      paddingVertical: 11,
                      alignItems: "center",
                    }
                  : {
                      backgroundColor: azd.bg.app,
                      borderRadius: azd.radius.pill,
                      paddingVertical: 11,
                      alignItems: "center",
                    }
              }
              textStyle={() => ({
                fontFamily: azd.font.display,
                fontWeight: "500",
                fontSize: 14,
                color: action.variant === "primary" ? "#FFFFFF" : azd.fg[4],
              })}
            >
              {action.label}
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    backgroundColor: azd.bg.surface,
    borderWidth: 1,
    borderColor: azd.border,
    borderTopLeftRadius: azd.radius.md,
    borderTopRightRadius: azd.radius.md,
    borderBottomRightRadius: azd.radius.md,
    borderBottomLeftRadius: azd.radius.xs,
    ...azd.shadow.card,
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: azd.divider,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: azd.radius.sm,
    backgroundColor: "rgba(5,121,134,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 14,
    color: azd.green[600],
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: azd.fg[5],
  },
  body: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 4,
  },
  primary: {
    fontFamily: azd.font.display,
    fontWeight: "700",
    fontSize: 17,
    color: azd.fg[1],
  },
  detail: {
    fontSize: 14,
    color: azd.fg[4],
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  actionButton: {
    flex: 1,
  },
})
