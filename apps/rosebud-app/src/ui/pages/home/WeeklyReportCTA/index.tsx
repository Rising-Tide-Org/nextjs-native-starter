import { Text, Flex, LinkOverlay, IconButton, Box } from '@chakra-ui/react'
import routes from 'lib/routes'
import moment from 'moment'
import { useEntryProvider } from 'providers/EntryProvider'
import { useMemo } from 'react'
import { IoIosArrowRoundForward } from 'react-icons/io'
import Panel from 'ui/core/Panel'
import { getWeekLabel } from 'util/entries'
import NextLink from 'next/link'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

const WeeklyReportCTA = () => {
  const { weeklySummaryAvailable } = useEntryProvider()

  const weekTextRange = useMemo(() => {
    if (weeklySummaryAvailable) {
      return getWeekLabel(
        moment(weeklySummaryAvailable, 'GGGG-WW').toDate(),
        false
      )
    }
    return ''
  }, [weeklySummaryAvailable])

  if (!weeklySummaryAvailable) {
    return null
  }

  return (
    <Panel
      variant='vstack'
      data-testid='entry-cta'
      position='relative'
      role='group'
      borderColor='transparent'
      bg='brand.500'
      py={3}
      _after={{
        content: '""',
        width: '0',
        height: '0',
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: '8px solid #E31665',
        position: 'absolute',
        top: '-9px',
        right: { base: '12px', md: '8px' },
        zIndex: '2',
      }}
    >
      <Box
        position='absolute'
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1}
        bg='linear-gradient(to right, #E31665, transparent);
'
      />
      <Box
        bg='url(/images/art/eucalyptus.png)'
        bgSize='cover'
        bgRepeat='no-repeat'
        bgPos='center'
        top={0}
        left={0}
        right={0}
        bottom={0}
        rounded='md'
        position='absolute'
        opacity={0.2}
        zIndex={0}
      />
      <Box zIndex={1}>
        <Flex align='center' w='100%' gap={4} justify='space-between'>
          <SmallCapsHeading color='white'>{weekTextRange}</SmallCapsHeading>
          <LinkOverlay
            as={NextLink}
            href={routes.entryWeek(weeklySummaryAvailable)}
            passHref
            shallow
          >
            <IconButton
              bg='transparent'
              color='white'
              size='sm'
              flexShrink={0}
              icon={<IoIosArrowRoundForward size='30px' />}
              data-testid='entry-cta-button'
              aria-label='View insights'
              _hover={{
                bg: 'inherit',
              }}
              _groupHover={{
                transform: 'translateX(4px)',
              }}
              position='absolute'
              right={2}
              bottom={2}
            />
          </LinkOverlay>
        </Flex>

        <Text textAlign='start' color='white' fontWeight={500}>
          Your weekly insights are ready!
        </Text>
      </Box>
    </Panel>
  )
}

export default WeeklyReportCTA
