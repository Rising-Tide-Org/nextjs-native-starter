import HelpButton from 'ui/shared/HelpButton'
import NavigationBar, { NavigationBarProps } from '..'

const NavigationBarSignedOut = (props: NavigationBarProps) => (
  <NavigationBar leftAction={null} rightAction={<HelpButton />} {...props} />
)

export default NavigationBarSignedOut
