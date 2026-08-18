import type { AttachmentMessage } from "@app-zum-doc/utils/api"
import { ChatAttachmentMessageBubble } from "@helpwave/hightide-native/components"

type AttachmentCardProps = {
  message: AttachmentMessage
  onDownload?: () => void
}

export function AttachmentCard({ message, onDownload }: AttachmentCardProps) {
  return (
    <ChatAttachmentMessageBubble
      direction={message.direction}
      name={message.fileName}
      metadata={`${message.fileType} · ${message.fileSize} · ${message.timeLabel}`}
      timestamp={message.timeLabel}
      downloadLabel="Anhang herunterladen"
      onDownload={onDownload}
    />
  )
}
