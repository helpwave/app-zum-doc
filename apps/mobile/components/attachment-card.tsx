import { Download, FileText } from "lucide-react-native"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"
import type { AttachmentMessage } from "app-zum-doc-utils/api/types"

type AttachmentCardProps = {
  message: AttachmentMessage
  onDownload?: () => void
}

export function AttachmentCard({ message, onDownload }: AttachmentCardProps) {
  return (
    <View
      style={[
        styles.card,
        message.direction === "outgoing" ? styles.alignEnd : styles.alignStart,
      ]}
    >
      <View style={styles.iconTile}>
        <FileText size={22} color={azd.semantic.danger} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.fileName} numberOfLines={1}>
          {message.fileName}
        </Text>
        <Text style={styles.fileMeta}>
          {message.fileType} · {message.fileSize} · {message.timeLabel}
        </Text>
      </View>
      <Pressable
        onPress={onDownload}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Anhang herunterladen"
      >
        <Download size={20} color={azd.green[600]} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 272,
    backgroundColor: azd.bg.surface,
    borderWidth: 1,
    borderColor: azd.border,
    borderTopLeftRadius: azd.radius.md,
    borderTopRightRadius: azd.radius.md,
    borderBottomRightRadius: azd.radius.md,
    borderBottomLeftRadius: azd.radius.xs,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...azd.shadow.card,
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: azd.radius.sm,
    backgroundColor: azd.semantic.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 14,
    color: azd.fg[1],
  },
  fileMeta: {
    marginTop: 3,
    fontSize: 12,
    color: azd.fg[5],
  },
})
