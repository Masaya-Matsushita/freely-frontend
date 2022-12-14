import 'src/style/globals.css'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import { AppMantineProvider } from 'src/lib/mantine'
import type { NextPageWithLayout } from 'src/lib/next'

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init)
  // エラー
  if (!res.ok) {
    throw new Error(String(res.status))
  }
  return res.json()
}

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <>
      <AppMantineProvider>
        <SWRConfig value={{ fetcher }}>
          {getLayout(<Component {...pageProps} />)}
        </SWRConfig>
      </AppMantineProvider>
    </>
  )
}

export default MyApp
