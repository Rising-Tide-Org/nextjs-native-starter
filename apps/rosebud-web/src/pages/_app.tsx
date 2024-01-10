import {
  ChakraProvider,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react'
import theme from 'styles/theme'
import 'styles/globals.css'
import 'styles/dot-animation-style.css'
import 'styles/audio-signal.css'
import 'swiper/css'
import Fonts from 'ui/global/Fonts'
import { Analytics } from '@vercel/analytics/react'
import GlobalHead from 'ui/global/Head'
import { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'
import { NextPage } from 'next'
import { AuthProvider } from 'providers/AuthProvider'
import AppInit from 'ui/global/AppInit'
import WithErrorBoundary from 'ui/core/ErrorBoundary'
import GlobalErrorBoundary from 'ui/core/ErrorBoundary/GlobalErrorBoundary'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)
  const cookies = typeof window === 'undefined' ? null : document.cookie
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManagerSSR(cookies)
      : localStorageManager

  return (
    <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
      <WithErrorBoundary
        errorRender={GlobalErrorBoundary}
        onError={(error, info) => console.error(error, info)}
      >
        <GlobalHead />
        <Fonts />
        <Analytics />
        <AppInit />
        <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
      </WithErrorBoundary>
    </ChakraProvider>
  )
}
