import type { NextPage } from 'next'
import { Shield, TriangleAlert } from 'lucide-react'
import type { PracticeOverview } from '@app-zum-doc/utils/api'
import { toAppLocale } from '@app-zum-doc/utils/api'
import { usePracticeOverview } from '@app-zum-doc/utils/hooks'
import { DashboardAppointmentRow } from '@/components/dashboard/appointment-row'
import { DashboardHeroCard, DashboardHeroMetric } from '@/components/dashboard/hero-card'
import { DashboardLegendItem } from '@/components/dashboard/legend-item'
import { DashboardMessageRow } from '@/components/dashboard/message-row'
import { DashboardNewsCard } from '@/components/dashboard/news-card'
import { RequestDistributionDonut } from '@/components/dashboard/request-distribution-donut'
import { Page, QueryState } from '@/components/layout/Page'
import { formatDashboardDateHeading } from '@/lib/datetime'
import { practiceNews } from '@/lib/news'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'
import { practiceOfficeId } from '@/lib/navigation'
import titleWrapper from '@/utils/titleWrapper'
import { Chip } from '@helpwave/hightide'

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
    <section
      className="grid grid-cols-1 desktop:grid-cols-3 gap-4 w-full p-4 desktop:p-6 rounded-2xl bg-cover bg-center"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.55)), url("/images/overview-hero.jpg")',
      }}
    >
      <DashboardHeroCard>
        <div className="flex-row-2 items-center text-description">
          <TriangleAlert className="size-5 text-warning" />
          <span>{t('overdueMessages')}</span>
        </div>
        <DashboardHeroMetric className="text-warning">
          {overview.overdueMessageCount}
        </DashboardHeroMetric>
      </DashboardHeroCard>

      <DashboardHeroCard>
        <span className="text-description">{t('appointmentsToday')}</span>
        <div className="flex-row-4 items-stretch w-full h-full">
          <div className="flex-col-1 flex-1 justify-between">
            <Chip color="primary" coloringStyle="tonal" size="sm" className="px-2 rounded-full">
              <Shield className="size-4" />
              <span>{t('insurancePublic')}</span>
            </Chip>
            <DashboardHeroMetric>
              {overview.todayAppointmentsGkv}
            </DashboardHeroMetric>
          </div>
          <div className="w-px bg-divider self-stretch" />
          <div className="flex-col-1 flex-1 justify-between">
            <Chip color="primary" coloringStyle="tonal" size="sm" className="px-2 rounded-full">
              <Shield className="size-4" />
              <span>{t('insurancePrivate')}</span>
            </Chip>
            <DashboardHeroMetric>
              {overview.todayAppointmentsPkv}
            </DashboardHeroMetric>
          </div>
        </div>
      </DashboardHeroCard>

      <DashboardHeroCard>
        <span className="text-description">{t('requestDistribution')}</span>
        <div className="flex-row-4 items-center">
          <RequestDistributionDonut distribution={overview.requestDistribution} />
          <ul className="flex-col-1 min-w-0">
            <DashboardLegendItem
              colorClassName="bg-primary"
              label={t('distributionSickNotes')}
              value={`${overview.requestDistribution.sickNotes} (${distributionPercent(overview.requestDistribution.sickNotes, total)})`}
            />
            <DashboardLegendItem
              colorClassName="bg-secondary"
              label={t('distributionReferrals')}
              value={`${overview.requestDistribution.referrals} (${distributionPercent(overview.requestDistribution.referrals, total)})`}
            />
            <DashboardLegendItem
              colorClassName="bg-warning"
              label={t('distributionAppointments')}
              value={`${overview.requestDistribution.appointments} (${distributionPercent(overview.requestDistribution.appointments, total)})`}
            />
          </ul>
        </div>
      </DashboardHeroCard>
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

            <div className="flex-col-1">
              <span className="text-description">{todayLabel}</span>
              <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6 w-full">
                <section className="flex-col-3 min-w-0">
                  <h2 className="typography-title-md text-primary">{t('appointmentsToday')}</h2>
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
          </div>
        )}
      </QueryState>
    </Page>
  )
}

export default OverviewPage
