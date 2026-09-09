import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Button, Input } from '@helpwave/hightide'
import {
  WeekdayUtils,
  type DoctorsOfficeOpeningHours,
  type Weekday,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { useDoctorsOffice, useUpdateDoctorsOffice } from '@app-zum-doc/utils/hooks'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { weekdayLabel } from '@/lib/labels'
import { practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

function hoursToInput(hours: string[]): string {
  return hours.join(', ')
}

function inputToHours(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

const PracticePage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const officeQuery = useDoctorsOffice({
    parameters: {
      id: practiceOfficeId,
      locale,
    },
  })
  const updateOffice = useUpdateDoctorsOffice()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [openingHours, setOpeningHours] = useState<Record<Weekday, string>>(
    WeekdayUtils.array.reduce((next, day) => {
      next[day] = ''
      return next
    }, {} as Record<Weekday, string>)
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const office = officeQuery.data
    if (!office) {
      return
    }
    setPhoneNumber(office.phoneNumber ?? '')
    setWebsiteUrl(office.websiteUrl ?? '')
    setOpeningHours(
      WeekdayUtils.array.reduce((next, day) => {
        next[day] = hoursToInput(office.openingHours[day] ?? [])
        return next
      }, {} as Record<Weekday, string>)
    )
  }, [officeQuery.data])

  const onSave = () => {
    const hours = WeekdayUtils.array.reduce((next, day) => {
      next[day] = inputToHours(openingHours[day] ?? '')
      return next
    }, {} as DoctorsOfficeOpeningHours)
    updateOffice.mutate({
      officeId: practiceOfficeId,
      locale,
      input: {
        phoneNumber,
        websiteUrl,
        openingHours: hours,
      },
    }, {
      onSuccess: () => {
        setSaved(true)
      },
    })
  }

  return (
    <Page pageTitle={titleWrapper(t('navSettings'))}>
      <QueryState
        isPending={officeQuery.isPending}
        isError={officeQuery.isError}
        error={officeQuery.error}
        onRetry={() => void officeQuery.refetch()}
        loadingLabel={t('loadingPractice')}
      >
        <div className="flex-col-6 max-w-2xl">
          <div className="flex-col-1">
            <h1 className="typography-title-lg text-primary">{t('navSettings')}</h1>
            <p className="text-description">{officeQuery.data?.name}</p>
          </div>

          <section className="flex-col-4">
            <h2 className="typography-title-md">{t('contactSection')}</h2>
            <label className="flex-col-1">
              <span className="typography-label-md">{t('phone')}</span>
              <Input
                value={phoneNumber}
                onValueChange={(value) => {
                  setSaved(false)
                  setPhoneNumber(value)
                }}
              />
            </label>
            <label className="flex-col-1">
              <span className="typography-label-md">{t('website')}</span>
              <Input
                value={websiteUrl}
                onValueChange={(value) => {
                  setSaved(false)
                  setWebsiteUrl(value)
                }}
              />
            </label>
          </section>

          <section className="flex-col-4">
            <div className="flex-col-1">
              <h2 className="typography-title-md">{t('hoursSection')}</h2>
              <p className="text-description">{t('hoursHint')}</p>
            </div>
            {WeekdayUtils.array.map((day) => (
              <label key={day} className="flex-col-1">
                <span className="typography-label-md">{weekdayLabel(day, t)}</span>
                <Input
                  value={openingHours[day] ?? ''}
                  onValueChange={(value) => {
                    setSaved(false)
                    setOpeningHours((current) => ({
                      ...current,
                      [day]: value,
                    }))
                  }}
                  placeholder={t('emptyPracticeHours')}
                />
              </label>
            ))}
          </section>

          <div className="flex-row-3 items-center">
            <Button
              color="primary"
              isProcessing={updateOffice.isPending}
              onClick={onSave}
            >
              {t('save')}
            </Button>
            {saved && <span className="text-description">{t('saved')}</span>}
          </div>
        </div>
      </QueryState>
    </Page>
  )
}

export default PracticePage
