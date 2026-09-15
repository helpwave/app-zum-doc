import { useMemo, useState } from 'react'
import { AppZumDocBadge } from '@helpwave/hightide'
import { KeySetupStep } from '@/components/onboarding/key-setup-step'
import { PracticeSetupStep } from '@/components/onboarding/practice-setup-step'

export function OnboardingStepper({
  needsKeySetup,
  needsPracticeSetup,
  onCompleted,
}: {
  needsKeySetup: boolean,
  needsPracticeSetup: boolean,
  onCompleted: () => void,
}) {
  const steps = useMemo(() => {
    const next: Array<'keys' | 'office'> = []
    if (needsKeySetup) {
      next.push('keys')
    }
    if (needsPracticeSetup) {
      next.push('office')
    }
    return next
  }, [needsKeySetup, needsPracticeSetup])
  const lastStepIndex = Math.max(steps.length - 1, 0)
  const [currentStep, setCurrentStep] = useState(0)
  const current = steps[currentStep] ?? steps[0]

  const goToNext = () => {
    if (currentStep >= lastStepIndex) {
      onCompleted()
      return
    }
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="flex flex-col items-center w-full h-dvh overflow-auto p-6">
      <div className="flex-col-6 w-full max-w-3xl py-8">
        <AppZumDocBadge size="lg" />
        {steps.length > 1 && (
          <div className="flex-row-2 items-center justify-center">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`rounded-full size-3 ${index === currentStep ? 'bg-primary' : 'bg-disabled'}`}
              />
            ))}
          </div>
        )}
        {current === 'keys' && (
          <KeySetupStep onCompleted={goToNext} />
        )}
        {current === 'office' && (
          <PracticeSetupStep onCompleted={onCompleted} />
        )}
      </div>
    </div>
  )
}
