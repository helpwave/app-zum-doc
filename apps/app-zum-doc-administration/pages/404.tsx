import type { NextPage } from 'next'
import { Page } from '@/components/layout/Page'

const NotFoundPage: NextPage = () => {
  return (
    <Page pageTitle="404">
      <h1 className="typography-title-lg">404</h1>
    </Page>
  )
}

export default NotFoundPage
