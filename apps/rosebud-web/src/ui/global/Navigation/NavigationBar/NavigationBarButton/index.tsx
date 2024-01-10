import { IconButton, IconButtonProps } from '@chakra-ui/react'

const NavigationBarButton = ({ icon, ...props }: IconButtonProps) => (
  <IconButton color='icon' icon={icon} variant='ghost' {...props} />
)

export default NavigationBarButton
