import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input } from '@helpwave/hightide'
import { QrCode } from 'lucide-react'
import {
  WeekdayUtils,
  defaultDoctorsOfficeOnlineServices,
  defaultDoctorsOfficeTemporaryNotifications,
  toAppLocale,
  type Address,
  type DoctorService,
  type DoctorsOfficeOnlineServices,
  type DoctorsOfficeOpeningHours,
  type DoctorsOfficeTemporaryNotifications,
  type UpdateDoctorsOfficeInput,
  type Weekday
} from '@app-zum-doc/utils/api'
import {
  useDoctorsOffice,
  useSpecializations,
  useUpdateDoctorsOffice
} from '@app-zum-doc/utils/hooks'
import { OnlineServicesEditor } from '@/components/practice/online-services-editor'
import { OpeningHoursEditor } from '@/components/practice/opening-hours-editor'
import { PracticeExpandableSection } from '@/components/practice/practice-expandable-section'
import { ProfilePictureField } from '@/components/practice/profile-picture-field'
import { ServicesEditor } from '@/components/practice/services-editor'
import { SettingsField } from '@/components/practice/settings-field'
import { SpecializationEditor } from '@/components/practice/specialization-editor'
import { TemporaryNotificationsEditor } from '@/components/practice/temporary-notifications-editor'
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

const MyDoctorsOfficePage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const officeQuery = useDoctorsOffice({
    parameters: {
      id: practiceOfficeId,
      locale,
    },
  })
  const specializationsQuery = useSpecializations({
    parameters: {
      search: '',
      locale,
    },
  })
  const updateOffice = useUpdateDoctorsOffice()
  const [name, setName] = useState('')
  const [imageUri, setImageUri] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [faxNumber, setFaxNumber] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [openingHours, setOpeningHours] = useState<Record<Weekday, OpeningHoursRange[]>>(
    emptyHours
  )
  const [openingHoursNote, setOpeningHoursNote] = useState('')
  const [specializationIds, setSpecializationIds] = useState<string[]>([])
  const [onlineServices, setOnlineServices] = useState<DoctorsOfficeOnlineServices>(
    defaultDoctorsOfficeOnlineServices
  )
  const [temporaryNotifications, setTemporaryNotifications] = useState<
    DoctorsOfficeTemporaryNotifications
  >(defaultDoctorsOfficeTemporaryNotifications)
  const [services, setServices] = useState<DoctorService[]>([])
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [pendingSection, setPendingSection] = useState<string | null>(null)

  useEffect(() => {
    const office = officeQuery.data
    if (!office) {
      return
    }
    setName(office.name)
    setImageUri(office.imageUri ?? '')
    setStreet(office.address.street)
    setStreetNumber(String(office.address.streetNumber))
    setPostalCode(office.address.postalCode)
    setCity(office.address.city)
    setPhoneNumber(office.phoneNumber ?? '')
    setFaxNumber(office.faxNumber ?? '')
    setWebsiteUrl(office.websiteUrl ?? '')
    setOpeningHours(
      WeekdayUtils.array.reduce((next, day) => {
        next[day] = parseOpeningHoursDay(office.openingHours[day] ?? [])
        return next
      }, {} as Record<Weekday, OpeningHoursRange[]>)
    )
    setOpeningHoursNote(office.openingHoursNote)
    setSpecializationIds(
      office.specializationIds.length > 0
        ? office.specializationIds
        : ['']
    )
    setOnlineServices(office.onlineServices)
    setTemporaryNotifications(office.temporaryNotifications)
    setServices(office.services.map((service) => ({ ...service })))
  }, [officeQuery.data])

  const hasInvalidHours = useMemo(() => (
    WeekdayUtils.array.some((day) =>
      (openingHours[day] ?? []).some(isOpeningHoursRangeInvalid))
  ), [openingHours])

  const markDirty = () => {
    setSavedSection(null)
  }

  const saveSection = (
    section: string,
    input: UpdateDoctorsOfficeInput
  ) => {
    setPendingSection(section)
    updateOffice.mutate({
      officeId: practiceOfficeId,
      locale,
      input,
    }, {
      onSuccess: () => {
        setSavedSection(section)
      },
      onSettled: () => {
        setPendingSection(null)
      },
    })
  }

  const saveBasicInformation = () => {
    if (name.trim().length === 0) {
      return
    }
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
    saveSection('basic', {
      name: name.trim(),
      imageUri,
      address,
    })
  }

  const saveContact = () => {
    saveSection('contact', {
      phoneNumber,
      faxNumber,
      websiteUrl,
    })
  }

  const saveHours = () => {
    if (hasInvalidHours) {
      return
    }
    const hours = WeekdayUtils.array.reduce((next, day) => {
      next[day] = serializeOpeningHoursDay(openingHours[day] ?? [])
      return next
    }, {} as DoctorsOfficeOpeningHours)
    saveSection('hours', {
      openingHours: hours,
      openingHoursNote,
    })
  }

  const saveSpecialization = () => {
    const nextIds = specializationIds.filter((id) => id.trim().length > 0)
    if (nextIds.length === 0) {
      return
    }
    saveSection('specialization', {
      specializationIds: nextIds,
    })
  }

  const saveOnlineServices = () => {
    saveSection('onlineServices', {
      onlineServices: {
        ...onlineServices,
        shipPrescriptionByMail: onlineServices.orderPrescriptions
          ? onlineServices.shipPrescriptionByMail
          : false,
      },
    })
  }

  const saveServices = () => {
    saveSection('services', {
      services: services.map((service) => ({
        id: service.id,
        name: service.name.trim(),
        ...(service.description?.trim()
          ? { description: service.description.trim() }
          : {}),
        ...(service.url?.trim()
          ? { url: service.url.trim() }
          : {}),
      })),
    })
  }

  const saveTemporaryNotifications = () => {
    saveSection('temporaryNotifications', {
      temporaryNotifications,
    })
  }

  return (
    <Page pageTitle={titleWrapper(t('navMyDoctorsOffice'))}>
      <QueryState
        isPending={officeQuery.isPending || specializationsQuery.isPending}
        isError={officeQuery.isError || specializationsQuery.isError}
        error={officeQuery.error ?? specializationsQuery.error}
        onRetry={() => {
          void officeQuery.refetch()
          void specializationsQuery.refetch()
        }}
        loadingLabel={t('loadingPractice')}
      >
        <div className="flex-col-6 w-full max-w-3xl">
          <h1 className="typography-title-lg text-primary">{t('navMyDoctorsOffice')}</h1>

          <PracticeExpandableSection
            title={t('basicInformation')}
            onSave={saveBasicInformation}
            canSave={name.trim().length > 0}
            isSaving={pendingSection === 'basic'}
            saved={savedSection === 'basic'}
          >
            <div className="flex-col-3 w-full">
              <ProfilePictureField
                label={t('profilePicture')}
                imageUri={imageUri}
                name={name}
                onFileSelected={(nextImageUri) => {
                  markDirty()
                  setImageUri(nextImageUri)
                }}
              />
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
              <Button
                type="button"
                color="primary"
                coloringStyle="text"
                className="self-start !min-w-0"
              >
                <QrCode className="size-4" />
                {t('downloadPatientQrCode')}
              </Button>
            </div>
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('contactSection')}
            onSave={saveContact}
            isSaving={pendingSection === 'contact'}
            saved={savedSection === 'contact'}
          >
            <div className="flex-col-3 w-full">
              <SettingsField label={t('phone')}>
                <Input
                  value={phoneNumber}
                  onValueChange={(value) => {
                    markDirty()
                    setPhoneNumber(value)
                  }}
                />
              </SettingsField>
              <SettingsField label={t('fax')}>
                <Input
                  value={faxNumber}
                  onValueChange={(value) => {
                    markDirty()
                    setFaxNumber(value)
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
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('hoursSection')}
            onSave={saveHours}
            canSave={!hasInvalidHours}
            isSaving={pendingSection === 'hours'}
            saved={savedSection === 'hours'}
          >
            <OpeningHoursEditor
              value={openingHours}
              onChange={(next) => {
                markDirty()
                setOpeningHours(next)
              }}
              note={openingHoursNote}
              onNoteChange={(next) => {
                markDirty()
                setOpeningHoursNote(next)
              }}
            />
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('specialization')}
            onSave={saveSpecialization}
            canSave={specializationIds.some((id) => id.trim().length > 0)}
            isSaving={pendingSection === 'specialization'}
            saved={savedSection === 'specialization'}
          >
            <SpecializationEditor
              value={specializationIds}
              options={specializationsQuery.data ?? []}
              onChange={(next) => {
                markDirty()
                setSpecializationIds(next)
              }}
            />
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('onlineServices')}
            onSave={saveOnlineServices}
            isSaving={pendingSection === 'onlineServices'}
            saved={savedSection === 'onlineServices'}
          >
            <OnlineServicesEditor
              value={onlineServices}
              onChange={(next) => {
                markDirty()
                setOnlineServices(next)
              }}
            />
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('servicesSection')}
            onSave={saveServices}
            isSaving={pendingSection === 'services'}
            saved={savedSection === 'services'}
          >
            <ServicesEditor
              value={services}
              onChange={(next) => {
                markDirty()
                setServices(next)
              }}
            />
          </PracticeExpandableSection>

          <PracticeExpandableSection
            title={t('temporaryNotificationsSection')}
            onSave={saveTemporaryNotifications}
            isSaving={pendingSection === 'temporaryNotifications'}
            saved={savedSection === 'temporaryNotifications'}
          >
            <TemporaryNotificationsEditor
              value={temporaryNotifications}
              onChange={(next) => {
                markDirty()
                setTemporaryNotifications(next)
              }}
            />
          </PracticeExpandableSection>
        </div>
      </QueryState>
    </Page>
  )
}

export default MyDoctorsOfficePage
