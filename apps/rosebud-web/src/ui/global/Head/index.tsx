import NextHead from 'next/head'

export const kDefaultProps = {
  title: 'Rosebud - AI Journal for Personal Growth',
  description:
    'Reflect with 10x the power and ease of traditional journaling. Over 11 million words journaled.',
  imageUrl: '/images/rosebud-og-v3.png',
}

const GlobalHead = () => (
  <NextHead>
    <title>{kDefaultProps.title}</title>
    <meta
      name='viewport'
      content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
    />

    {/* PWA */}
    <meta name='apple-mobile-web-app-capable' content='yes' />
    <meta name='apple-mobile-web-app-status-bar-style' content='default' />
    <meta name='apple-mobile-web-app-title' content='Rosebud' />

    <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
    <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
    <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
    <link rel='manifest' href='/manifest.json' />
    <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#eb0f63' />
    <meta name='application-name' content='Rosebud' />
    <meta name='msapplication-TileColor' content='#eb0f63' />
    <meta name='theme-color' content='#ffffff' />

    {/* Open Graph  */}
    <meta property='og:title' content={kDefaultProps.title} />
    <meta key='og:type' property='og:type' content='website' />

    {/* Description is required for SEO  */}
    <meta property='og:description' content={kDefaultProps.description} />
    <meta
      key='description'
      name='description'
      content={kDefaultProps.description}
    />
    <meta
      key='twitter:description'
      name='twitter:description'
      content={kDefaultProps.description}
    />

    {/* Image  */}
    <meta property='og:image' content={kDefaultProps.imageUrl} />
    <meta
      key='twitter:card'
      name='twitter:card'
      content='summary_large_image'
    />
    <meta
      key='twitter:image'
      name='twitter:image'
      content={kDefaultProps.imageUrl}
    />
  </NextHead>
)

export default GlobalHead
