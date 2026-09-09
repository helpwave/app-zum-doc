import Image from 'next/image'
import type { AppLocale } from '@app-zum-doc/utils/api'
import { formatNewsDate } from '@/lib/datetime'
import type { PracticeNewsItem } from '@/lib/news'

export function DashboardNewsCard({
  item,
  locale,
}: {
  item: PracticeNewsItem,
  locale: AppLocale,
}) {
  return (
    <article className="dashboard-news-card">
      <div className="dashboard-news-image-wrap">
        <Image
          src={item.imageSrc}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="object-cover"
        />
      </div>
      <span className="text-description">{formatNewsDate(item.date, locale)}</span>
      <h3 className="dashboard-news-title">{item.title[locale]}</h3>
      <p className="text-description">{item.body[locale]}</p>
    </article>
  )
}
