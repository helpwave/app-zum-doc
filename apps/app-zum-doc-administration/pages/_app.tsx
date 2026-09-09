import Head from 'next/head'
import type { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import { HightideProvider } from '@helpwave/hightide'
import titleWrapper from '@/utils/titleWrapper'
import { queryClient } from '@/lib/query-client'
import { administrationTranslation } from '@/i18n/translations'
import '../globals.css'

function AdministrationApp({
  Component,
  pageProps,
}: AppProps) {
  return (
    <HightideProvider
      translation={{ translation: administrationTranslation }}
    >
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>{titleWrapper()}</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
          />
        </Head>
        <Component {...pageProps} />
      </QueryClientProvider>
    </HightideProvider>
  )
}

export default AdministrationApp
