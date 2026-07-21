import { CheckCheck } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"
import type { TextMessage } from "app-zum-doc-utils/api/types"

type MessageBubbleProps = {
  message: TextMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing"

  return (
    <View
      style={[
        styles.wrap,
        outgoing ? styles.wrapOutgoing : styles.wrapIncoming,
      ]}
    >
      <View
        style={[
          styles.bubble,
          outgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
        ]}
      >
        <Text style={[styles.body, outgoing ? styles.bodyOutgoing : styles.bodyIncoming]}>
          {message.body}
        </Text>
        <Text style={[styles.time, outgoing ? styles.timeOutgoing : styles.timeIncoming]}>
          {message.timeLabel}
        </Text>
      </View>
      {outgoing && message.receipt === "read" ? (
        <View style={styles.receipt}>
          <CheckCheck size={15} color={azd.green[600]} />
          <Text style={styles.receiptText}>Gelesen</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: 280,
    gap: 4,
  },
  wrapIncoming: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  wrapOutgoing: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  bubbleIncoming: {
    backgroundColor: azd.divider,
    borderTopLeftRadius: azd.radius.md,
    borderTopRightRadius: azd.radius.md,
    borderBottomRightRadius: azd.radius.md,
    borderBottomLeftRadius: azd.radius.xs,
  },
  bubbleOutgoing: {
    backgroundColor: azd.green[600],
    borderTopLeftRadius: azd.radius.md,
    borderTopRightRadius: azd.radius.md,
    borderBottomLeftRadius: azd.radius.md,
    borderBottomRightRadius: azd.radius.xs,
  },
  body: {
    fontFamily: azd.font.display,
    fontWeight: "300",
    fontSize: 16,
    lineHeight: 22.4,
  },
  bodyIncoming: {
    color: azd.fg[1],
  },
  bodyOutgoing: {
    color: "#FFFFFF",
  },
  time: {
    marginTop: 5,
    fontWeight: "500",
    fontSize: 11,
    textAlign: "right",
  },
  timeIncoming: {
    color: azd.fg[5],
  },
  timeOutgoing: {
    color: "rgba(255,255,255,0.75)",
  },
  receipt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingRight: 2,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: "500",
    color: azd.fg[5],
  },
})
