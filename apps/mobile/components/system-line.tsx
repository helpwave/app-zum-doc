import { CircleCheck } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"

type SystemLineProps = {
  body: string
}

export function SystemLine({ body }: SystemLineProps) {
  return (
    <View style={styles.row}>
      <CircleCheck size={14} color={azd.green[600]} />
      <Text style={styles.text}>{body}</Text>
    </View>
  )
}

export function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  text: {
    fontFamily: azd.font.display,
    fontSize: 12,
    fontWeight: "500",
    color: azd.green[600],
    textAlign: "center",
  },
  pill: {
    alignSelf: "center",
    backgroundColor: azd.bg.surface,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: azd.radius.pill,
    ...azd.shadow.card,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: azd.fg[5],
  },
})
