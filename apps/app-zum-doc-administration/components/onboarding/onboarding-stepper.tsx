import { useState } from 'react'
import { KeySetupStep } from '@/components/onboarding/key-setup-step'
import { PasswordPromptStep } from '@/components/onboarding/password-prompt-step'
import { PracticeSetupStep } from '@/components/onboarding/practice-setup-step'
import { WelcomeStep } from '@/components/onboarding/welcome-step'

export type OnboardingStepId = 'welcome' | 'keys' | 'password' | 'office'

function insertKeySetupStep(steps: OnboardingStepId[]): OnboardingStepId[] {
  if (steps.includes('keys')) {
    return steps
  }
  const passwordIndex = steps.indexOf('password')
  if (passwordIndex < 0) {
    return ['keys', ...steps]
  }
  return [
    ...steps.slice(0, passwordIndex),
    'keys',
    ...steps.slice(passwordIndex),
  ]
}

export function OnboardingStepper({
  steps,
  onCompleted,
}: {
  steps: OnboardingStepId[],
  onCompleted: () => void,
}) {
  const [flow, setFlow] = useState(steps)
  const [currentStep, setCurrentStep] = useState(0)
  const lastStepIndex = Math.max(flow.length - 1, 0)
  const current = flow[currentStep] ?? flow[0]

  const goToNext = () => {
    if (currentStep >= lastStepIndex) {
      onCompleted()
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const onResetEncryptionKey = () => {
    const nextFlow = insertKeySetupStep(flow)
    setFlow(nextFlow)
    setCurrentStep(nextFlow.indexOf('keys'))
  }

  return (
    <div className="flex items-center justify-center w-full h-dvh p-4">
      <div
        className="flex-col-4 p-4 rounded-2xl surface coloring-solid shadow-around-md overflow-hidden"
        style={{
          width: 'min(90vw, 30rem)',
          minWidth: 'min(90vw, 30rem)',
          maxWidth: 'min(90vw, 30rem)',
          height: 'min(90vh, 60rem)',
          minHeight: 'min(90vh, 60rem)',
          maxHeight: 'min(90vh, 60rem)',
        }}
      >
        {flow.length > 1 && (
          <div className="flex-row-2 items-center justify-center shrink-0">
            {flow.map((step, index) => (
              <div
                key={`${step}-${index}`}
                className={`rounded-full size-3 ${index === currentStep ? 'bg-primary' : 'bg-disabled'}`}
              />
            ))}
          </div>
        )}
        <div className="flex-1 min-h-0 w-full">
          {current === 'welcome' && (
            <WelcomeStep onContinue={goToNext} />
          )}
          {current === 'keys' && (
            <KeySetupStep onCompleted={goToNext} />
          )}
          {current === 'password' && (
            <PasswordPromptStep
              onCompleted={goToNext}
              onResetEncryptionKey={onResetEncryptionKey}
            />
          )}
          {current === 'office' && (
            <PracticeSetupStep onCompleted={onCompleted} />
          )}
        </div>
      </div>
    </div>
  )
}
