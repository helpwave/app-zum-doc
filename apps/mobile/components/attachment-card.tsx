import {
  formatMessageTime,
  toAppLocale,
  type AttachmentMessage,
} from "@app-zum-doc/utils/api"
import { ChatAttachmentMessageBubble } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"

type AttachmentCardProps = {
  message: AttachmentMessage
  onDownload?: () => void
}

export function AttachmentCard({ message, onDownload }: AttachmentCardProps) {
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const formattedTime = formatMessageTime(message.time, locale)

  return (
    <ChatAttachmentMessageBubble
      direction={message.direction}
      name={message.fileName}
      metadata={`${message.fileType} · ${message.fileSize}`}
      timestamp={formattedTime}
      downloadLabel="Anhang herunterladen"
      onDownload={onDownload}
    />
  )
}
