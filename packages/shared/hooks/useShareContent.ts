import { useToast } from '@chakra-ui/react'
import { useCallback } from 'react'
import MakeToast from 'ui/core/MakeToast'

type ShareContentOptions = {
  title?: string
  text: string
  url?: string
  source?: string
}

const kDefaultUrl = 'https://rosebud.app'

const useShareContent = () => {
  const toast = useToast()
  const shareContent = useCallback(
    async ({
      title,
      text,
      url = kDefaultUrl,
      source = 'notset',
    }: ShareContentOptions) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url,
          })
        } catch (err) {
          console.error('Error sharing:', err)
        }
      } else {
        // Fallback to copying to clipboard
        try {
          const final = title ? `${title}\n${text}` : text
          await navigator.clipboard.writeText(
            url
              ? `${final}\n\n${
                  url === kDefaultUrl ? 'via Rosebud ' : ''
                }${url}?ref=share-${source}`
              : final
          )
          toast(
            MakeToast({
              title: 'Copied to clipboard',
              status: 'success',
            })
          )
        } catch (err) {
          console.error('Error copying to clipboard:', err)
        }
      }
    },
    [toast]
  )

  return shareContent
}

export default useShareContent
