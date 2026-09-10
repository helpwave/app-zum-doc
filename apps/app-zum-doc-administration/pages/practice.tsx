import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input } from '@helpwave/hightide'
import {
  WeekdayUtils,
  type Address,
  type DoctorsOfficeOpeningHours,
  type Weekday,
  toAppLocale
} from '@app-zum-doc/utils/api'
import { useDoctorsOffice, useUpdateDoctorsOffice } from '@app-zum-doc/utils/hooks'
import { OpeningHoursEditor } from '@/components/practice/opening-hours-editor'
import { SettingsField } from '@/components/practice/settings-field'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import {
  isOpeningHoursRangeInvalid,
  parseOpeningHoursDay,
  serializeOpeningHoursDay,
  type OpeningHoursRange
} from '@/lib/opening-hours-form'
import { practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

function emptyHours(): Record<Weekday, OpeningHoursRange[]> {
  return WeekdayUtils.array.reduce((next, day) => {
    next[day] = []
    return next
  }, {} as Record<Weekday, OpeningHoursRange[]>)
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
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [openingHours, setOpeningHours] = useState<Record<Weekday, OpeningHoursRange[]>>(
    emptyHours
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const office = officeQuery.data
    if (!office) {
      return
    }
    setName(office.name)
    setStreet(office.address.street)
    setStreetNumber(String(office.address.streetNumber))
    setPostalCode(office.address.postalCode)
    setCity(office.address.city)
    setPhoneNumber(office.phoneNumber ?? '')
    setWebsiteUrl(office.websiteUrl ?? '')
    setOpeningHours(
      WeekdayUtils.array.reduce((next, day) => {
        next[day] = parseOpeningHoursDay(office.openingHours[day] ?? [])
        return next
      }, {} as Record<Weekday, OpeningHoursRange[]>)
    )
  }, [officeQuery.data])

  const hasInvalidHours = useMemo(() => (
    WeekdayUtils.array.some((day) =>
      (openingHours[day] ?? []).some(isOpeningHoursRangeInvalid))
  ), [openingHours])

  const markDirty = () => {
    setSaved(false)
  }

  const onSave = () => {
    if (hasInvalidHours || name.trim().length === 0) {
      return
    }
    const hours = WeekdayUtils.array.reduce((next, day) => {
      next[day] = serializeOpeningHoursDay(openingHours[day] ?? [])
      return next
    }, {} as DoctorsOfficeOpeningHours)
    const parsedStreetNumber = Number.parseInt(streetNumber, 10)
    const address: Address = {
      country: officeQuery.data?.address.country ?? 'Deutschland',
      city: city.trim(),
      postalCode: postalCode.trim(),
      street: street.trim(),
      streetNumber: Number.isNaN(parsedStreetNumber) ? 0 : parsedStreetNumber,
      ...(officeQuery.data?.address.province
        ? { province: officeQuery.data.address.province }
        : {}),
    }
    updateOffice.mutate({
      officeId: practiceOfficeId,
      locale,
      input: {
        name: name.trim(),
        phoneNumber,
        websiteUrl,
        openingHours: hours,
        address,
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
        <div className="flex-col-6 w-full max-w-3xl">
          <h1 className="typography-title-lg text-primary">{t('navSettings')}</h1>

          <Card title={t('basicInformation')}>
            <div className="flex-col-3 w-full pt-2">
              <SettingsField label={t('clinicName')}>
                <Input
                  value={name}
                  onValueChange={(value) => {
                    markDirty()
                    setName(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('street')}>
                <Input
                  value={street}
                  onValueChange={(value) => {
                    markDirty()
                    setStreet(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('streetNumber')}>
                <Input
                  value={streetNumber}
                  onValueChange={(value) => {
                    markDirty()
                    setStreetNumber(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('postalCode')}>
                <Input
                  value={postalCode}
                  onValueChange={(value) => {
                    markDirty()
                    setPostalCode(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('city')}>
                <Input
                  value={city}
                  onValueChange={(value) => {
                    markDirty()
                    setCity(value)
                  }}
                />
              </SettingsField>
            </div>
          </Card>

          <Card title={t('contactSection')}>
            <div className="flex-col-3 w-full pt-2">
              <SettingsField label={t('phone')}>
                <Input
                  value={phoneNumber}
                  onValueChange={(value) => {
                    markDirty()
                    setPhoneNumber(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('website')}>
                <Input
                  value={websiteUrl}
                  onValueChange={(value) => {
                    markDirty()
                    setWebsiteUrl(value)
                  }}
                />
              </SettingsField>
            </div>
          </Card>

          <Card title={t('hoursSection')}>
            <div className="flex-col-3 w-full pt-2">
              <OpeningHoursEditor
                value={openingHours}
                onChange={(next) => {
                  markDirty()
                  setOpeningHours(next)
                }}
              />
            </div>
          </Card>

          <div className="flex-row-3 items-center">
            <Button
              color="primary"
              disabled={hasInvalidHours || name.trim().length === 0}
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
