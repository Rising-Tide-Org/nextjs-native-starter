import { Flex, Tooltip, Text, Icon } from '@chakra-ui/react'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { CgLock } from 'react-icons/cg'
import Panel from 'ui/core/Panel'
import { RbShare } from 'ui/shared/Icon'

type Props = {
  text: string
  locked: boolean
  onShare: () => void
}

const InsightCard = ({ text, locked, onShare }: Props) => {
  const { openSubscribeModal } = useSubscriptionProvider()
  return (
    <Panel w='full' position='relative' bg='bgSecondary' variant='vstack'>
      <Flex
        align='top'
        w='full'
        justify='space-between'
        gap={2}
        filter={locked ? 'blur(4px)' : undefined}
        opacity={locked ? 0.2 : 1}
      >
        <Text whiteSpace='pre-wrap' data-sentry-block>
          {text}
        </Text>
        <Tooltip label='Share insight' shouldWrapChildren openDelay={1000}>
          <RbShare
            mt='-8px'
            boxSize='18px'
            color='icon'
            _hover={{
              color: 'iconHover',
            }}
            cursor='pointer'
            onClick={() => onShare()}
          />
        </Tooltip>
      </Flex>
      {locked && (
        <Flex
          position='absolute'
          top={0}
          left={0}
          w='full'
          h='full'
          align='center'
          justify='center'
          cursor='pointer'
          onClick={() => openSubscribeModal('weeklyInsight')}
          role='group'
        >
          <Flex align='center' px={2} py={1} gap={1}>
            <Icon
              as={CgLock}
              boxSize={{ base: 4, md: 5 }}
              color='brandGray.700'
              _groupHover={{
                base: {},
                md: { color: 'brandGray.800' },
              }}
            />
            <Text
              color='brandGray.700'
              fontSize='15px'
              _groupHover={{ color: 'brandGray.800' }}
            >
              Upgrade to unlock
            </Text>
          </Flex>
        </Flex>
      )}
    </Panel>
  )
}

export default InsightCard
