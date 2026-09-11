import { LabelledCheckbox } from '@helpwave/hightide'

export function EmailNotificationFields({
  enabled,
  label,
  description,
  checkboxLabel,
  onEnabledChange,
}: {
  enabled: boolean,
  label: string,
  description: string,
  checkboxLabel: string,
  onEnabledChange: (enabled: boolean) => void,
}) {
  return (
    <div className="flex-col-3 w-full">
      <div className="flex-col-1">
        <h3 className="typography-title-sm">{label}</h3>
        <p className="text-description">{description}</p>
      </div>
      <LabelledCheckbox
        label={checkboxLabel}
        value={enabled}
        onValueChange={onEnabledChange}
      />
    </div>
  )
}
