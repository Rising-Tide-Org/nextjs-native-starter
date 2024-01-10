import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { kModalMap } from './modals'
import { kVersionsWithReleaseNotes } from 'constants/releaseNotes'
import { useUserProvider } from 'providers/UserProvider'
import Analytics from 'lib/analytics'
import { getStackTrace } from 'util/error'

/**
 * ModalProvider
 *
 * This component is a provider that allows generalized modals to be opened from anywhere in the app.
 * The available modals are defined in `src/providers/ModalProvider/modals.tsx`
 */

type ModalId = keyof typeof kModalMap
type ModalOpenFunction = (modalId: ModalId) => void

const defaultOpenModal = (_modalId: ModalId) => {}
const ModalProviderContext = createContext<ModalOpenFunction>(defaultOpenModal)

/**
 * React hook that reads from `ModalProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useModalProvider = () => {
  const context = useContext(ModalProviderContext)
  if (context === defaultOpenModal) {
    // TODO this needs to be rethought a bit as we are using this hook in a few places where it is not wrapped in a ModalProvider, password reset, singin, singup
    // throw new Error('useModalProvider must be used within a ModalProvider')
    Analytics.trackEvent('modal.context.error', {
      error: 'useModalProvider must be used within a ModalProvider',
      trace: getStackTrace(),
    })
  }
  return context
}

type Props = {
  children: ReactNode
}

export function ModalProvider({ children }: Props) {
  const { user } = useUserProvider()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [currentModalId, setCurrentModalId] = useState<ModalId | null>(null)

  /**
   * Open a modal
   * @param modalId - The id of the modal to open, defined in `src/providers/ModalProvider/modals.tsx`
   */
  const openModal: ModalOpenFunction = useCallback(
    (modalId: ModalId) => {
      if (kModalMap[modalId]) {
        setCurrentModalId(modalId)
        onOpen()
      } else {
        console.error(`No modal found for id: ${modalId}`)
      }
    },
    [onOpen]
  )

  /**
   * Show the what's new modal if the user has not seen it yet for this version
   */
  useEffect(() => {
    if (user.metadata?.lastSeenReleaseNotes !== kVersionsWithReleaseNotes[0]) {
      openModal('releaseNotes')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.metadata?.lastSeenReleaseNotes])

  return (
    <ModalProviderContext.Provider value={openModal}>
      {children}
      {isOpen &&
        currentModalId &&
        kModalMap[currentModalId] &&
        createElement(kModalMap[currentModalId], { isOpen, onClose })}
    </ModalProviderContext.Provider>
  )
}
