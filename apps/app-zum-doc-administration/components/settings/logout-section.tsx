import { useState } from 'react'
import { Button, ConfirmDialog } from '@helpwave/hightide'
import { queryClient } from '@/lib/query-client'
import { clearLocalUserData } from '@/lib/encryption-storage'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function LogoutSection() {
  const t = useAdministrationTranslation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const onLogout = () => {
    clearLocalUserData()
    queryClient.clear()
    window.location.assign('/')
  }

  return (
    <>
      <Button
        type="button"
        color="negative"
        coloringStyle="tonal"
        className="self-start"
        onClick={() => setIsConfirmOpen(true)}
      >
        {t('logout')}
      </Button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        titleElement={t('logoutConfirmTitle')}
        description={t('logoutConfirmDescription')}
        confirmType="negative"
        buttonOverwrites={[
          {},
          {},
          { text: t('logout'), color: 'negative' },
        ]}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={onLogout}
      />
    </>
  )
}
