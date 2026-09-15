import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { LanguageSelect, ThemeSelect } from '@helpwave/hightide'
import {
  defaultDoctorsOfficeEmailNotifications,
  toAppLocale,
  type DoctorsOfficeEmailNotifications
} from '@app-zum-doc/utils/api'
import { useDoctorsOffice, useUpdateDoctorsOffice } from '@app-zum-doc/utils/hooks'
import { PracticeExpandableSection } from '@/components/practice/practice-expandable-section'
import { SettingsField } from '@/components/practice/settings-field'
import { EmailNotificationFields } from '@/components/settings/email-notification-fields'
import { EncryptionSection } from '@/components/settings/encryption-section'
import { HourFormatSelect } from '@/components/settings/hour-format-select'
import { Page, QueryState } from '@/components/layout/Page'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

const SettingsPage: NextPage = () => {
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
  const [emailNotifications, setEmailNotifications] = useState<DoctorsOfficeEmailNotifications>(
    defaultDoctorsOfficeEmailNotifications
  )

  useEffect(() => {
    const office = officeQuery.data
    if (!office) {
      return
    }
    setEmailNotifications(office.emailNotifications)
  }, [officeQuery.data])

  const persistNotifications = (next: DoctorsOfficeEmailNotifications) => {
    setEmailNotifications(next)
    updateOffice.mutate({
      officeId: practiceOfficeId,
      locale,
      input: {
        emailNotifications: {
          ...next,
          requestEmail: next.requestEmail.trim(),
          chatEmail: next.chatEmail.trim(),
        },
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
        <div className="flex-col-6 w-full max-w-160">
          <h1 className="typography-title-lg text-primary">{t('navSettings')}</h1>

          <PracticeExpandableSection title={t('localizationSection')}>
            <div className="flex-col-3 w-full">
              <SettingsField label={t('language')}>
                <LanguageSelect />
              </SettingsField>
              <SettingsField label={t('hourFormat')}>
                <HourFormatSelect />
              </SettingsField>
            </div>
          </PracticeExpandableSection>

          <PracticeExpandableSection title={t('displaySection')}>
            <div className="flex-col-3 w-full">
              <SettingsField label={t('themeMode')}>
                <ThemeSelect />
              </SettingsField>
            </div>
          </PracticeExpandableSection>

          <PracticeExpandableSection title={t('notificationsSection')}>
            <div className="flex-col-6 w-full">
              <EmailNotificationFields
                label={t('requestNotificationsTitle')}
                description={t('requestNotificationsDescription')}
                checkboxLabel={t('emailNotificationConsent')}
                enabled={emailNotifications.requestEnabled}
                onEnabledChange={(requestEnabled) => {
                  persistNotifications({
                    ...emailNotifications,
                    requestEnabled,
                  })
                }}
              />
              <EmailNotificationFields
                label={t('chatNotificationsTitle')}
                description={t('chatNotificationsDescription')}
                checkboxLabel={t('emailNotificationConsent')}
                enabled={emailNotifications.chatEnabled}
                onEnabledChange={(chatEnabled) => {
                  persistNotifications({
                    ...emailNotifications,
                    chatEnabled,
                  })
                }}
              />
            </div>
          </PracticeExpandableSection>

          <EncryptionSection />
        </div>
      </QueryState>
    </Page>
  )
}

export default SettingsPage
