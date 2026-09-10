import type { ReactNode } from 'react'

export function SettingsField({
  label,
  children,
}: {
  label: string,
  children: ReactNode,
}) {
  return (
    <label className="flex-col-1 w-full min-w-0">
      <span className="w-40 shrink-0 typography-label-md">{label}</span>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </label>
  )
}
