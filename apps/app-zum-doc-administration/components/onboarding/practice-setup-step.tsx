import { useEffect, useState } from 'react'
import { Button, FormFieldLayout, Input } from '@helpwave/hightide'
import { toAppLocale, type Address } from '@app-zum-doc/utils/api'
import {
  useCompletePracticeOnboarding,
  usePracticeMyData,
  useSpecializations
} from '@app-zum-doc/utils/hooks'
import { QueryState } from '@/components/layout/Page'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { SpecializationEditor } from '@/components/practice/specialization-editor'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'

export function PracticeSetupStep({
  onCompleted,
}: {
  onCompleted: () => void,
}) {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const myDataQuery = usePracticeMyData()
  const specializationsQuery = useSpecializations({
    parameters: {
      search: '',
      locale,
    },
  })
  const completeOnboarding = useCompletePracticeOnboarding()
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [specializationIds, setSpecializationIds] = useState<string[]>([])

  useEffect(() => {
    const myData = myDataQuery.data
    if (!myData) {
      return
    }
    setName(myData.name)
    setStreet(myData.address.street)
    setStreetNumber(String(myData.address.streetNumber))
    setPostalCode(myData.address.postalCode)
    setCity(myData.address.city)
  }, [myDataQuery.data])

  const canSubmit = name.trim().length > 0
    && street.trim().length > 0
    && postalCode.trim().length > 0
    && city.trim().length > 0
    && specializationIds.some((id) => id.trim().length > 0)
    && !completeOnboarding.isPending

  const onSubmit = () => {
    if (!canSubmit) {
      return
    }
    const parsedStreetNumber = Number.parseInt(streetNumber, 10)
    const address: Address = {
      country: myDataQuery.data?.address.country ?? 'Deutschland',
      city: city.trim(),
      postalCode: postalCode.trim(),
      street: street.trim(),
      streetNumber: Number.isNaN(parsedStreetNumber) ? 0 : parsedStreetNumber,
      ...(myDataQuery.data?.address.province
        ? { province: myDataQuery.data.address.province }
        : {}),
    }
    completeOnboarding.mutate({
      locale,
      input: {
        name: name.trim(),
        address,
        specializationIds: specializationIds.filter((id) => id.trim().length > 0),
      },
    }, {
      onSuccess: onCompleted,
    })
  }

  return (
    <OnboardingScreen
      title={t('onboardingPracticeTitle')}
      description={t('onboardingPracticeDescription')}
      footer={(
        <Button
          type="button"
          color="primary"
          disabled={!canSubmit}
          isProcessing={completeOnboarding.isPending}
          onClick={onSubmit}
        >
          {t('onboardingFinish')}
        </Button>
      )}
    >
      <QueryState
        isPending={myDataQuery.isPending || specializationsQuery.isPending}
        isError={myDataQuery.isError || specializationsQuery.isError}
        error={myDataQuery.error ?? specializationsQuery.error}
        onRetry={() => {
          void myDataQuery.refetch()
          void specializationsQuery.refetch()
        }}
        loadingLabel={t('loadingOnboarding')}
      >
        <div className="flex-col-4 w-full">
          <FormFieldLayout label={t('clinicName')}>
            {({ id }) => (
              <Input id={id} value={name} onValueChange={setName} />
            )}
          </FormFieldLayout>
          <FormFieldLayout label={t('street')}>
            {({ id }) => (
              <Input id={id} value={street} onValueChange={setStreet} />
            )}
          </FormFieldLayout>
          <FormFieldLayout label={t('streetNumber')}>
            {({ id }) => (
              <Input id={id} value={streetNumber} onValueChange={setStreetNumber} />
            )}
          </FormFieldLayout>
          <FormFieldLayout label={t('postalCode')}>
            {({ id }) => (
              <Input id={id} value={postalCode} onValueChange={setPostalCode} />
            )}
          </FormFieldLayout>
          <FormFieldLayout label={t('city')}>
            {({ id }) => (
              <Input id={id} value={city} onValueChange={setCity} />
            )}
          </FormFieldLayout>
          <FormFieldLayout label={t('specialization')}>
            {() => (
              <SpecializationEditor
                value={specializationIds}
                options={specializationsQuery.data ?? []}
                onChange={setSpecializationIds}
              />
            )}
          </FormFieldLayout>
        </div>
      </QueryState>
    </OnboardingScreen>
  )
}
