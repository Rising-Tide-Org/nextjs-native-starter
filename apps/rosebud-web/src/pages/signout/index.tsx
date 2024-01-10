import { useAuthProvider } from 'providers/AuthProvider'
import { ReactElement, useEffect } from 'react'
import Layout from 'ui/global/Layout'
import PageLoading from 'ui/global/PageLoading'

const SignOutPage = () => {
  const { signOut } = useAuthProvider()

  useEffect(() => {
    signOut()
  }, [signOut])

  return <PageLoading />
}

SignOutPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav h='full'>
      {page}
    </Layout>
  )
}

export default SignOutPage
