import { useState } from 'react'
import { Button, ChatMessageCard } from '@helpwave/hightide'
import type { StructuredCardMessage } from '@app-zum-doc/utils/api'
import { RequestDetailDialog } from '@/components/requests/request-detail-dialog'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function RequestChatMessages({
  message,
}: {
  message: StructuredCardMessage,
}) {
  const t = useAdministrationTranslation()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const requestId = message.requestId

  return (
    <>
      <ChatMessageCard
        direction={message.direction}
        title={message.title}
        subtitle={message.subtitle}
        actions={requestId ? (
          <Button
            type="button"
            color="primary"
            coloringStyle="text"
            className="!min-w-0"
            onClick={() => setIsDetailOpen(true)}
          >
            {t('showMore')}
          </Button>
        ) : undefined}
      >
        <div className="flex-col-1">
          <span>{message.primary}</span>
          <span className="text-description">{message.detail}</span>
        </div>
      </ChatMessageCard>
      {requestId && (
        <RequestDetailDialog
          isOpen={isDetailOpen}
          requestId={isDetailOpen ? requestId : null}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  )
}
