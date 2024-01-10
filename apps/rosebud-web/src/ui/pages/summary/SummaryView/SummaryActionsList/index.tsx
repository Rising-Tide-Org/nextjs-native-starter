import { Box } from '@chakra-ui/react'
import { useNavigationProvider } from 'providers/NavigationProvider'
import { UserFlag } from 'types/User'
import { kViewPadding } from 'ui/constants'
import MotionBox from 'ui/core/MotionBox'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import CoachMark from 'ui/shared/CoachMark'
import { RbManifest } from 'ui/shared/Icon'
import List from 'ui/shared/List'
import ListItem from 'ui/shared/List/ListItem'
import SummarySuggestions from '../SummarySuggestions'

type Props = {
  title: string
}

const SummaryActionsList = ({ title }: Props) => {
  const { pushView } = useNavigationProvider()

  return (
    <Box px={kViewPadding}>
      <MotionBox
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.05,
          ease: [0.43, 0.13, 0.23, 1],
        }}
      >
        <SmallCapsHeading>Explore further</SmallCapsHeading>

        <List>
          <CoachMark
            flag={UserFlag.entitiesTipSeen}
            delay={5000}
            offset={[0, 8]}
          >
            <Box>
              <ListItem
                icon={<RbManifest boxSize='18px' color='yellow.900' />}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                  ease: [0.43, 0.13, 0.23, 1],
                }}
                onSelect={() => pushView(<SummarySuggestions title={title} />)}
              >
                {title}
              </ListItem>
            </Box>
          </CoachMark>
        </List>
      </MotionBox>
    </Box>
  )
}

export default SummaryActionsList
