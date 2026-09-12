import { Input, LabelledCheckbox, Textarea } from '@helpwave/hightide'
import {
  temporaryNotificationKeys,
  type DoctorsOfficeTemporaryNotifications,
  type TemporaryNotificationKey
} from '@app-zum-doc/utils/api'
import { SettingsField } from '@/components/practice/settings-field'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

const tileLabels: Record<
  TemporaryNotificationKey,
  'temporaryNotificationProfile'
  | 'temporaryNotificationAppointments'
  | 'temporaryNotificationPrescriptions'
  | 'temporaryNotificationReferrals'
> = {
  profile: 'temporaryNotificationProfile',
  appointments: 'temporaryNotificationAppointments',
  prescriptions: 'temporaryNotificationPrescriptions',
  referrals: 'temporaryNotificationReferrals',
}

export function TemporaryNotificationsEditor({
  value,
  onChange,
}: {
  value: DoctorsOfficeTemporaryNotifications,
  onChange: (next: DoctorsOfficeTemporaryNotifications) => void,
}) {
  const t = useAdministrationTranslation()

  return (
    <div className="flex-col-4 w-full">
      <p className="text-description">{t('temporaryNotificationsDescription')}</p>
      {temporaryNotificationKeys.map((key) => {
        const tile = value[key]
        return (
          <div key={key} className="flex-col-3 w-full">
            <LabelledCheckbox
              label={t(tileLabels[key])}
              value={tile.enabled}
              onValueChange={(enabled) => {
                onChange({
                  ...value,
                  [key]: {
                    ...tile,
                    enabled,
                  },
                })
              }}
            />
            {tile.enabled && (
              <div className="flex-col-3 w-full pl-8">
                <SettingsField label={t('temporaryNotificationTitle')}>
                  <Input
                    value={tile.title}
                    onValueChange={(title) => {
                      onChange({
                        ...value,
                        [key]: {
                          ...tile,
                          title,
                        },
                      })
                    }}
                  />
                </SettingsField>
                <SettingsField label={t('temporaryNotificationDescription')}>
                  <Textarea
                    value={tile.description}
                    rows={3}
                    onValueChange={(description) => {
                      onChange({
                        ...value,
                        [key]: {
                          ...tile,
                          description,
                        },
                      })
                    }}
                  />
                </SettingsField>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
