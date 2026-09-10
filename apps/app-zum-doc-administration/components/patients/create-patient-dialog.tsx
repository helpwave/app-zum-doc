import { useState } from 'react'
import { Button, Dialog, Input } from '@helpwave/hightide'
import { BackIconButton } from '@/components/layout/back-icon-button'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function CreatePatientDialog({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: {
  isOpen: boolean,
  onClose: () => void,
  onCreate: (input: {
    firstName: string,
    lastName: string,
    dateOfBirth: string,
  }) => void,
  isCreating: boolean,
}) {
  const t = useAdministrationTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  const reset = () => {
    setFirstName('')
    setLastName('')
    setDateOfBirth('')
  }

  const canSubmit = firstName.trim().length > 0
    && lastName.trim().length > 0
    && dateOfBirth.length > 0

  return (
    <Dialog
      isOpen={isOpen}
      titleElement={t('createPatientTitle')}
      description={t('createPatientDescription')}
      onClose={() => {
        reset()
        onClose()
      }}
      className="w-96"
    >
      <div className="flex-col-3">
        <label className="flex-col-1">
          <span className="typography-label-md">{t('firstName')}</span>
          <Input value={firstName} onValueChange={setFirstName} />
        </label>
        <label className="flex-col-1">
          <span className="typography-label-md">{t('lastName')}</span>
          <Input value={lastName} onValueChange={setLastName} />
        </label>
        <label className="flex-col-1">
          <span className="typography-label-md">{t('dateOfBirth')}</span>
          <Input
            type="date"
            value={dateOfBirth}
            onValueChange={setDateOfBirth}
          />
        </label>
      </div>
      <div className="flex-row-3 justify-end mt-4">
        <BackIconButton
          onClick={() => {
            reset()
            onClose()
          }}
        />
        <Button
          color="primary"
          disabled={!canSubmit || isCreating}
          isProcessing={isCreating}
          onClick={() => {
            onCreate({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              dateOfBirth,
            })
          }}
        >
          {t('addPatient')}
        </Button>
      </div>
    </Dialog>
  )
}
