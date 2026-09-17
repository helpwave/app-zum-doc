import type { ReactNode } from 'react'

export function SettingsField({
  label,
  children,
}: {
  label: string,
  children: ReactNode,
}) {
  return (
    <span className="flex-col-1 w-full min-w-0">
      <label className="w-40 shrink-0 typography-label-md">{label}</label>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </span>
  )
}
