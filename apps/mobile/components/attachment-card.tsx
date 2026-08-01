import { ChatAttachmentCard } from "@helpwave/hightide-native/components"
import type { AttachmentMessage } from "@app-zum-doc/utils/api"

type AttachmentCardProps = {
  message: AttachmentMessage
  onDownload?: () => void
}

export function AttachmentCard({ message, onDownload }: AttachmentCardProps) {
  return (
    <ChatAttachmentCard
      direction={message.direction}
      name={message.fileName}
      metadata={`${message.fileType} · ${message.fileSize} · ${message.timeLabel}`}
      downloadLabel="Anhang herunterladen"
      onDownload={onDownload}
    />
  )
}
