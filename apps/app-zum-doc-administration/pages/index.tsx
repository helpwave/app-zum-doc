import type { NextPage } from 'next'
import { Shield, TriangleAlert } from 'lucide-react'
import type { PracticeOverview } from '@app-zum-doc/utils/api'
import { toAppLocale } from '@app-zum-doc/utils/api'
import { usePracticeOverview } from '@app-zum-doc/utils/hooks'
import { DashboardAppointmentRow } from '@/components/dashboard/appointment-row'
import { DashboardMessageRow } from '@/components/dashboard/message-row'
import { DashboardNewsCard } from '@/components/dashboard/news-card'
import { RequestDistributionDonut } from '@/components/dashboard/request-distribution-donut'
import { Page, QueryState } from '@/components/layout/Page'
import { formatDashboardDateHeading } from '@/lib/datetime'
import { practiceNews } from '@/lib/news'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'

function distributionPercent(value: number, total: number): string {
  if (total <= 0) {
    return '0%'
  }
  return `${Math.round((value / total) * 100)}%`
}

function HeroStats({ overview }: { overview: PracticeOverview }) {
  const t = useAdministrationTranslation()
  const total = overview.requestDistribution.sickNotes
    + overview.requestDistribution.referrals
    + overview.requestDistribution.appointments

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-card">
        <div className="flex-row-2 items-center text-description">
          <TriangleAlert className="size-5 text-warning" />
          <span>{t('overdueMessages')}</span>
        </div>
        <span className="dashboard-hero-metric text-warning">
          {overview.overdueMessageCount}
        </span>
      </div>

      <div className="dashboard-hero-card">
        <span className="text-description">{t('appointmentsToday')}</span>
        <div className="dashboard-hero-split">
          <div className="flex-col-1">
            <div className="flex-row-1 items-center text-description">
              <Shield className="size-4" />
              <span>{t('insurancePublic')}</span>
            </div>
            <span className="dashboard-hero-metric">
              {overview.todayAppointmentsGkv}
            </span>
          </div>
          <div className="dashboard-hero-split-divider" />
          <div className="flex-col-1">
            <div className="flex-row-1 items-center text-description">
              <Shield className="size-4" />
              <span>{t('insurancePrivate')}</span>
            </div>
            <span className="dashboard-hero-metric">
              {overview.todayAppointmentsPkv}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-hero-card">
        <span className="text-description">{t('requestDistribution')}</span>
        <div className="flex-row-4 items-center">
          <RequestDistributionDonut distribution={overview.requestDistribution} />
          <ul className="flex-col-1 min-w-0">
            <li className="dashboard-legend-item">
              <span className="dashboard-legend-dot bg-primary" />
              <span className="truncate">{t('distributionSickNotes')}</span>
              <span className="dashboard-legend-value">
                {overview.requestDistribution.sickNotes}
                {' '}
                ({distributionPercent(overview.requestDistribution.sickNotes, total)})
              </span>
            </li>
            <li className="dashboard-legend-item">
              <span className="dashboard-legend-dot bg-secondary" />
              <span className="truncate">{t('distributionReferrals')}</span>
              <span className="dashboard-legend-value">
                {overview.requestDistribution.referrals}
                {' '}
                ({distributionPercent(overview.requestDistribution.referrals, total)})
              </span>
            </li>
            <li className="dashboard-legend-item">
              <span className="dashboard-legend-dot bg-warning" />
              <span className="truncate">{t('distributionAppointments')}</span>
              <span className="dashboard-legend-value">
                {overview.requestDistribution.appointments}
                {' '}
                ({distributionPercent(overview.requestDistribution.appointments, total)})
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

const OverviewPage: NextPage = () => {
  const t = useAdministrationTranslation()
  const { locale: localizationLocale } = useLocale()
  const locale = toAppLocale(localizationLocale)
  const overviewQuery = usePracticeOverview({
    parameters: {
      officeId: practiceOfficeId,
      locale,
    },
  })
  const overview = overviewQuery.data
  const todayLabel = formatDashboardDateHeading(new Date(), locale)

  return (
    <Page pageTitle={titleWrapper(t('navOverview'))}>
      <QueryState
        isPending={overviewQuery.isPending}
        isError={overviewQuery.isError}
        error={overviewQuery.error}
        onRetry={() => void overviewQuery.refetch()}
        loadingLabel={t('loadingOverview')}
      >
        {overview && (
          <div className="flex-col-8 w-full">
            <h1 className="typography-title-lg text-primary">{t('navOverview')}</h1>
            <HeroStats overview={overview} />

            <div className="dashboard-columns">
              <section className="flex-col-3 min-w-0">
                <div className="flex-col-0">
                  <span className="text-description">{todayLabel}</span>
                  <h2 className="typography-title-md text-primary">{t('appointmentsToday')}</h2>
                </div>
                {overview.todayAppointments.length === 0 ? (
                  <p className="text-description">{t('noAppointmentsToday')}</p>
                ) : (
                  <div className="flex-col-3">
                    {overview.todayAppointments.map((appointment) => (
                      <DashboardAppointmentRow
                        key={appointment.id}
                        appointment={appointment}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="flex-col-3 min-w-0">
                <h2 className="typography-title-md text-primary">{t('messagesTitle')}</h2>
                {overview.recentMessages.length === 0 ? (
                  <p className="text-description">{t('noMessages')}</p>
                ) : (
                  <div className="flex-col-3">
                    {overview.recentMessages.map((message) => (
                      <DashboardMessageRow
                        key={message.conversationId}
                        message={message}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="flex-col-3 min-w-0">
                <h2 className="typography-title-md text-primary">{t('newsTitle')}</h2>
                <div className="flex-col-4">
                  {practiceNews.map((item) => (
                    <DashboardNewsCard key={item.id} item={item} locale={locale} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </QueryState>
    </Page>
  )
}

export default OverviewPage
