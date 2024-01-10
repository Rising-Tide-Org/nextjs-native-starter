import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import Script from 'next/script'
import { parseCookies } from 'nookies'
import theme from 'styles/theme'
import { convertVersionToInt } from 'util/version'

export default class RootDocument extends Document<{ colorMode: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    let colorMode = theme.config.initialColorMode

    if (ctx?.req?.headers.cookie) {
      colorMode =
        parseCookies(ctx)['chakra-ui-color-mode'] ||
        theme.config.initialColorMode
    }

    return { ...initialProps, colorMode }
  }

  render() {
    const { colorMode } = this.props

    return (
      // We need to ensure that if the app is in dark mode and the page is refresh, the color mode
      // doesn't flicker from light -> dark mode. Setting colorScheme on the Html component ensures it
      // maintains the same theme right from initial load of then page
      <Html lang='en' data-theme={colorMode} style={{ colorScheme: colorMode }}>
        <Script
          id='app-version'
          strategy='lazyOnload'
          dangerouslySetInnerHTML={{
            __html: `<!-- App version ${
              process.env.APP_VERSION || 'unknown'
            } (${convertVersionToInt(process.env.APP_VERSION)}) -->
        `,
          }}
        />
        <Head />
        <body className={`chakra-ui-${colorMode}`}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
