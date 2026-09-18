import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, IconButton } from '@helpwave/hightide'
import { TriangleAlert, X } from 'lucide-react'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import {
  hasOfficeIncompleteBannerTimer,
  writeOfficeIncompleteBannerTimer
} from '@/lib/office-incomplete-banner-storage'

export function DashboardOfficeIncompleteBanner() {
  const t = useAdministrationTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(!hasOfficeIncompleteBannerTimer())
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="flex-col-3 desktop:flex-row desktop:items-center desktop:justify-between w-full p-4 rounded-2xl bg-warning/15 text-warning">
      <div className="flex-row-3 items-start min-w-0">
        <TriangleAlert className="size-5 shrink-0 mt-0.5" />
        <div className="flex-col-1 min-w-0">
          <span className="typography-label-lg">
            {t('officeInformationIncompleteTitle')}
          </span>
          <p className="text-sm">
            {t('officeInformationIncompleteDescription')}
          </p>
        </div>
      </div>
      <div className="flex-row-3 items-center shrink-0 self-end desktop:self-center">
        <Link href="/my-doctors-office" className="shrink-0">
          <Button color="primary">{t('completeOfficeInformation')}</Button>
        </Link>
        <IconButton
          type="button"
          tooltip={t('dismissOfficeInformationBanner')}
          size="sm"
          color="neutral"
          coloringStyle="text"
          aria-label={t('dismissOfficeInformationBanner')}
          onClick={() => {
            writeOfficeIncompleteBannerTimer(Date.now())
            setIsVisible(false)
          }}
        >
          <X className="size-5" />
        </IconButton>
      </div>
    </div>
  )
}
