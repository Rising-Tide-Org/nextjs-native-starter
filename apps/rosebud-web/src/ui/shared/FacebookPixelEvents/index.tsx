import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const FacebookPixelEvents = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_APP_ID as string
    if (appId) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init(appId)
          ReactPixel.pageView()
        })
    }
  }, [pathname, searchParams])

  return null
}
