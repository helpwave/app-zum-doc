import clsx from 'clsx'
import type { ReactNode } from 'react'

export function OnboardingScreen({
  title,
  description,
  titleClassName,
  descriptionClassName,
  children,
  footer,
}: {
  title: ReactNode,
  description?: ReactNode,
  titleClassName?: string,
  descriptionClassName?: string,
  children?: ReactNode,
  footer?: ReactNode,
}) {
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-col-2 shrink-0">
        <h1 className={titleClassName ?? 'typography-title-lg text-primary px-2'}>
          {title}
        </h1>
        {description != null && (
          <p className={clsx(descriptionClassName ?? 'text-description', 'px-2')}>
            {description}
          </p>
        )}
      </div>
      <div className="flex-col-4 flex-1 min-h-0 overflow-auto p-2">
        {children}
      </div>
      {footer != null && (
        <div className="flex-row-3 items-center justify-end shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}
