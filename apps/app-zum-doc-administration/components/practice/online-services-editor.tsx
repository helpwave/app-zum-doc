import { LabelledCheckbox } from '@helpwave/hightide'
import type { DoctorsOfficeOnlineServices } from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function OnlineServicesEditor({
  value,
  onChange,
}: {
  value: DoctorsOfficeOnlineServices,
  onChange: (next: DoctorsOfficeOnlineServices) => void,
}) {
  const t = useAdministrationTranslation()

  return (
    <div className="flex-col-3 w-full">
      <div className="flex-col-2 w-full">
        <LabelledCheckbox
          label={t('onlineServiceOrderPrescriptions')}
          value={value.orderPrescriptions}
          onValueChange={(orderPrescriptions) => {
            onChange({
              ...value,
              orderPrescriptions,
              shipPrescriptionByMail: orderPrescriptions
                ? value.shipPrescriptionByMail
                : false,
            })
          }}
        />
        {value.orderPrescriptions && (
          <div className="pl-8">
            <LabelledCheckbox
              label={t('onlineServicePrescriptionMail')}
              value={value.shipPrescriptionByMail}
              onValueChange={(shipPrescriptionByMail) => {
                onChange({
                  ...value,
                  shipPrescriptionByMail,
                })
              }}
            />
          </div>
        )}
      </div>
      <LabelledCheckbox
        label={t('onlineServiceOrderReferrals')}
        value={value.orderReferrals}
        onValueChange={(orderReferrals) => {
          onChange({
            ...value,
            orderReferrals,
          })
        }}
      />
      <LabelledCheckbox
        label={t('onlineServiceReceiveDocuments')}
        value={value.receiveDocuments}
        onValueChange={(receiveDocuments) => {
          onChange({
            ...value,
            receiveDocuments,
          })
        }}
      />
      <LabelledCheckbox
        label={t('onlineServiceRequestAppointments')}
        value={value.requestAppointments}
        onValueChange={(requestAppointments) => {
          onChange({
            ...value,
            requestAppointments,
          })
        }}
      />
    </div>
  )
}
