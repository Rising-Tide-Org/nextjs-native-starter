import { useAuthProvider } from 'providers/AuthProvider'
import EmailUpdate from '../EmailUpdate'
import PasswordUpdate from '../PasswordUpdate'

const AccountSettings = () => {
  const { user: authUser } = useAuthProvider()
  return (
    <>
      <EmailUpdate />
      {authUser?.email ? <PasswordUpdate /> : null}
    </>
  )
}

export default AccountSettings
