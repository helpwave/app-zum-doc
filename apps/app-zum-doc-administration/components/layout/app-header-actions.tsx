import Link from 'next/link'
import { useRouter } from 'next/router'
import { Avatar, IconButton } from '@helpwave/hightide'
import { Pencil, Settings } from 'lucide-react'
import { profilePictureSrc } from '@/components/practice/profile-picture-field'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function AppHeaderActions({
  practiceName,
  practiceImageUri,
}: {
  practiceName: string,
  practiceImageUri?: string,
}) {
  const t = useAdministrationTranslation()
  const router = useRouter()
  const practiceImage = practiceImageUri
    ? profilePictureSrc(practiceImageUri)
    : undefined
  const staffName = t('staffName')

  return (
    <div className="flex-row-3 items-center justify-end w-full min-w-0">
      <Link
        href="/my-doctors-office"
        className="flex-row-2 items-center min-w-0 rounded-lg px-2 py-1"
        aria-label={t('navMyDoctorsOffice')}
      >
        <Avatar
          size="sm"
          name={practiceName}
          image={practiceImage
            ? { avatarUrl: practiceImage, alt: practiceName }
            : undefined}
        />
        <span className="typography-title-sm truncate">{practiceName}</span>
        <Pencil className="size-4 shrink-0" />
      </Link>
      <IconButton
        type="button"
        tooltip={t('navSettings')}
        size="sm"
        color="primary"
        coloringStyle="text"
        aria-label={t('navSettings')}
        onClick={() => void router.push('/settings')}
      >
        <Settings className="size-5" />
      </IconButton>
      <button
        type="button"
        className="flex-row-2 items-center shrink-0 rounded-lg px-2 py-1"
        aria-label={t('userMenu')}
      >
        <Avatar size="sm" name={staffName} />
        <span className="typography-label-md whitespace-nowrap">{staffName}</span>
      </button>
    </div>
  )
}
