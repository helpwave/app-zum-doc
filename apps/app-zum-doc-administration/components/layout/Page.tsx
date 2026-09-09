import type { PropsWithChildren, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  AppPage,
  AppZumDocBadge,
  AppZumDocLogo,
  Button,
  LanguageDialog,
  Menu,
  MenuItem,
  type AppPageNavigationItem
} from '@helpwave/hightide'
import {
  CalendarDays,
  ChevronDown,
  Forward,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Settings,
  Users
} from 'lucide-react'
import { toAppLocale } from '@app-zum-doc/utils/api'
import { usePracticeOverview } from '@app-zum-doc/utils/hooks'
import { NavLabel } from '@/components/layout/nav-label'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import {
  activeNavUrl,
  parseRequestKind,
  practiceOfficeId,
  requestKindPath
} from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

type PageProps = PropsWithChildren<{
  pageTitle?: string,
  noScrolling?: boolean,
}>

export const Page = ({
  children,
  pageTitle,
  noScrolling,
}: PageProps) => {
  const translation = useAdministrationTranslation()
  const router = useRouter()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const overviewQuery = usePracticeOverview({
    parameters: {
      officeId: practiceOfficeId,
      locale,
    },
  })
  const counts = overviewQuery.data

  const sidebarItems = useMemo((): AppPageNavigationItem[] => [
    {
      id: 'overview',
      label: <NavLabel label={translation('navOverview')} />,
      url: '/',
      icon: <LayoutDashboard className="size-5" />,
    },
    {
      id: 'patients',
      label: <NavLabel label={translation('navPatients')} count={counts?.patientCount} />,
      url: '/patients',
      icon: <Users className="size-5" />,
    },
    {
      id: 'chat',
      label: <NavLabel label={translation('navChat')} count={counts?.unreadChatCount} />,
      url: '/chat',
      icon: <MessageSquare className="size-5" />,
    },
    {
      id: 'appointments',
      label: (
        <NavLabel
          label={translation('navAppointments')}
          count={counts?.openAppointments}
        />
      ),
      url: requestKindPath('appointment'),
      icon: <CalendarDays className="size-5" />,
    },
    {
      id: 'prescriptions',
      label: (
        <NavLabel
          label={translation('navPrescriptions')}
          count={counts?.openPrescriptions}
        />
      ),
      url: requestKindPath('prescription'),
      icon: <Pill className="size-5" />,
    },
    {
      id: 'referrals',
      label: (
        <NavLabel
          label={translation('navReferrals')}
          count={counts?.openReferrals}
        />
      ),
      url: requestKindPath('referral'),
      icon: <Forward className="size-5" />,
    },
    {
      id: 'settings',
      label: <NavLabel label={translation('navSettings')} />,
      url: '/practice',
      icon: <Settings className="size-5" />,
    },
  ], [counts, translation])

  const practiceName = counts?.office.name ?? translation('appName')
  const path = router.asPath.split('?')[0] ?? '/'
  const requestKind = parseRequestKind(router.query['kind'])

  return (
    <AppPage
      sidebarProps={{
        header: (
          <Link href="/" className="flex-row-2 items-center p-2">
            <AppZumDocBadge size="md" />
          </Link>
        ),
        items: sidebarItems,
        activeUrl: activeNavUrl(path, requestKind),
        LinkComponent: Link,
        footer: (
          <span className="text-description text-xs px-2 pb-3">
            {translation('sidebarFooter')}
          </span>
        ),
      }}
      headerActions={[
        (
          <div key="practice" className="flex-row-2 items-center min-w-0">
            <AppZumDocLogo size="sm" />
            <span className="typography-title-sm truncate">{practiceName}</span>
          </div>
        ),
        (
          <Menu
            key="user"
            options={{
              horizontalAlignment: 'afterEnd',
              verticalAlignment: 'afterEnd',
            }}
            aria-label={translation('userMenu')}
            trigger={(bag, ref) => (
              <Button
                ref={ref}
                size="sm"
                color="primary"
                coloringStyle="solid"
                className="rounded-full !min-w-0"
                aria-label={translation('userMenu')}
                onClick={bag.toggleOpen}
              >
                {translation('staffName')}
                <ChevronDown className="size-4" />
              </Button>
            )}
          >
            {(bag) => (
              <>
                <MenuItem
                  onClick={() => {
                    bag.close()
                    void router.push('/practice')
                  }}
                >
                  {translation('navSettings')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    bag.close()
                    setIsLanguageOpen(true)
                  }}
                >
                  {translation('language')}
                </MenuItem>
              </>
            )}
          </Menu>
        ),
      ]}
      noScrolling={noScrolling}
    >
      <Head>
        <title>{titleWrapper(pageTitle)}</title>
      </Head>
      <LanguageDialog
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
      />
      {children}
    </AppPage>
  )
}

export function QueryState({
  isPending,
  isError,
  error,
  onRetry,
  loadingLabel,
  children,
}: {
  isPending: boolean,
  isError: boolean,
  error?: Error | null,
  onRetry: () => void,
  loadingLabel: string,
  children: ReactNode,
}) {
  const translation = useAdministrationTranslation()

  if (isPending) {
    return <p className="text-description">{loadingLabel}</p>
  }

  if (isError) {
    return (
      <div className="flex-col-2">
        <h2 className="typography-title-md">{translation('errorTitle')}</h2>
        <p className="text-description">{error?.message ?? translation('errorUnknown')}</p>
        <button type="button" className="text-primary" onClick={onRetry}>
          {translation('retry')}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
