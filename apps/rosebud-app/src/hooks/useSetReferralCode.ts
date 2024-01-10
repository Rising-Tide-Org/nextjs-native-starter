import { kLSAppPrefix } from 'constants/localStorage'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage'

const useSetReferralCode = () => {
  const router = useRouter()
  const [referralCodeSet, setReferralCodeSet] = useState(false)
  const [referralCode, setReferralCode] = useLocalStorage<
    string | null | undefined
  >(`${kLSAppPrefix}/referralCode`, null)

  useEffect(() => {
    const { pathname, query }: any = router
    if (!referralCode && query?.r) {
      setReferralCode(query.r)
      const params = new URLSearchParams(query)
      params.delete('r')
      router.replace({ pathname, query: params.toString() }, undefined, {
        shallow: true,
      })
    }
    setReferralCodeSet(true)
  }, [referralCode, router, setReferralCode])

  return [referralCode, referralCodeSet]
}

export default useSetReferralCode
