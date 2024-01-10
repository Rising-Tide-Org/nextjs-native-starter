import { Text, Flex, LinkOverlay, IconButton, Box } from '@chakra-ui/react'
import routes from 'lib/routes'
import { IoIosArrowRoundForward } from 'react-icons/io'
import Panel from 'ui/core/Panel'
import NextLink from 'next/link'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { LuPartyPopper } from 'react-icons/lu'

const YearInReviewCTA = () => {
  return (
    <Panel
      variant='vstack'
      data-testid='entry-cta'
      position='relative'
      role='group'
      borderColor='transparent'
      bg='gold.600'
      py={3}
    >
      <Box
        position='absolute'
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1}
      />
      <Box
        bg='url(/images/art/sunrise.png)'
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
        <Flex align='center' w='100%' justify='space-between'>
          <Flex direction='row' gap={2}>
            <LuPartyPopper color='white' />
            <SmallCapsHeading color='white'>Year in Review</SmallCapsHeading>
          </Flex>
          <LinkOverlay as={NextLink} href={routes.review} passHref shallow>
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
          Review your 2023 on Rosebud
        </Text>
      </Box>
    </Panel>
  )
}

export default YearInReviewCTA
