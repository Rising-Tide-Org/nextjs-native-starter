import dynamic from 'next/dynamic'

const PushNotificationModal = dynamic(
  () => import('ui/shared/modals/PushNotificationModal'),
  { ssr: false }
)
const InstallAppModal = dynamic(
  () => import('ui/shared/modals/InstallAppModal')
)
const WhatsNewModal = dynamic(() => import('ui/shared/modals/WhatsNewModal'))
const PersonalizationModal = dynamic(
  () => import('ui/shared/modals/PersonalizationModal')
)
const ReferralModal = dynamic(() => import('ui/shared/modals/ReferralModal'))
const MemoryModal = dynamic(() => import('ui/shared/modals/MemoryModal'))

/**
 * Modal map
 * These are the modals that can be opened by the ModalProvider
 */
export const kModalMap: { [key: string]: React.ComponentType<any> } = {
  referral: ReferralModal,
  releaseNotes: WhatsNewModal,
  installApp: InstallAppModal,
  pushNotifications: PushNotificationModal,
  personalization: PersonalizationModal,
  memory: MemoryModal,
}
