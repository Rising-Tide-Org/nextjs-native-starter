import {
  Flex,
  Heading,
  Image,
  Stat as ChakraStat,
  StatLabel,
  StatNumber,
  useColorMode,
  useColorModeValue,
  VStack,
  Text,
  Divider,
  Tag,
  Spacer,
} from '@chakra-ui/react'
import { CollectionItemTopic } from 'types/Collection'
import { Stat } from 'types/Stat'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { RbEightPointStar } from 'ui/shared/Icon'

type Props = {
  sinceDate?: number
  stats: Stat
  groupedTopics?: Record<string, CollectionItemTopic[] | undefined>
}

const kTopicDefaults: Record<string, any> = {
  person: {
    label: 'Top People',
    emoji: '👥',
    bgColor: '#DAE2F6',
  },
  theme: {
    label: 'Hot Topics',
    emoji: '🔥',
    bgColor: '#FFD6D6',
  },
}

const ExportYearStats = ({ sinceDate, stats, groupedTopics }: Props) => {
  const { colorMode } = useColorMode()
  const bgColor = useColorModeValue('brandGray.100', 'gray.800')
  const bgColor2 = useColorModeValue('brandGray.200', 'gray.700')

  return (
    <Flex
      id='yearly-stats'
      direction='column'
      gap={4}
      backgroundColor={bgColor}
      w='400px'
      px={4}
      pt={10}
      pb={8}
      zIndex={-999}
      position='absolute'
      top='-100000'
      left='-100000'
    >
      <Flex direction='column'>
        <Flex
          direction='row'
          w='full'
          align='center'
          justifyContent='center'
          position='relative'
        >
          <Heading fontSize='5xl' fontFamily='Outfit' textAlign='center'>
            20
          </Heading>
          <Flex marginTop='30px' marginRight='10px'>
            <RbEightPointStar color='bloom.600' boxSize='30px' mt={1} ml={1} />
          </Flex>
          <Heading fontSize='5xl' fontFamily='Outfit' textAlign='center'>
            23
          </Heading>
        </Flex>
        {sinceDate && (
          <SmallCapsHeading
            color='gray.300'
            textAlign='center'
            fontWeight={700}
            letterSpacing={1.5}
            py={0}
            marginTop='10px'
          >
            Year in Review
          </SmallCapsHeading>
        )}
      </Flex>
      <VStack w='full'>
        <Flex direction='row' w='full' justifyContent='space-between' gap={2}>
          <ChakraStat>
            <Panel>
              <StatNumber textAlign='center' fontSize='36px'>
                {stats.words.toLocaleString('en-us')}
              </StatNumber>
              <StatLabel textAlign='center' fontSize='sm' marginBottom='20px'>
                Words written
              </StatLabel>
            </Panel>
          </ChakraStat>
          <ChakraStat>
            <Panel>
              <StatNumber textAlign='center' fontSize='36px'>
                {stats.longestStreak ?? 0} days
              </StatNumber>
              <StatLabel textAlign='center' fontSize='sm' marginBottom='20px'>
                Longest streak
              </StatLabel>
            </Panel>
          </ChakraStat>
        </Flex>
      </VStack>

      <Flex direction='row' pt={6}>
        {groupedTopics &&
          Object.entries(groupedTopics)
            .sort((a, b) => a[0].localeCompare(b[0]))
            ?.filter(([type]) => type !== 'emotion')
            .map(([type, topics]) => {
              const { label, emoji, bgColor } = kTopicDefaults[type]
              return (
                <Flex key={type} direction='column' gap={2} w='full' px={1}>
                  <Flex direction='row' align='center' gap={2}>
                    <Flex
                      backgroundColor={bgColor}
                      w='30px'
                      h='30px'
                      align='center'
                      justifyContent='center'
                      borderRadius={100}
                    >
                      <Text lineHeight='30px' marginBottom='15px'>
                        {emoji}
                      </Text>
                    </Flex>
                    <Text fontSize='16px' fontWeight={600} marginBottom='15px'>
                      {label}
                    </Text>
                  </Flex>
                  <Divider />
                  {topics?.slice(0, 3).map((topic, index) => (
                    <Flex key={index} direction='row' gap={2}>
                      <Tag
                        height='20px'
                        width='20px'
                        backgroundColor={bgColor2}
                        flex={0}
                        fontWeight={400}
                        marginTop='12px'
                      >
                        <Text
                          fontSize={10}
                          fontWeight={600}
                          marginBottom='12px'
                        >
                          {index + 1}
                        </Text>
                      </Tag>
                      <Flex direction='column' gap={0}>
                        <Text fontSize={15}>{topic.title}</Text>
                        <Text color='brandGray.500' fontSize={12}>
                          {topic.metadata.mentions} mentions
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              )
            })}
      </Flex>

      <Spacer />
      <Flex
        direction='column'
        w='full'
        justifyContent='center'
        alignItems='center'
        gap={2}
      >
        <Image
          height={7}
          src={colorMode === 'dark' ? '/logo-type-light.svg' : '/logo-type.svg'}
          alt='Rosebud logo'
        />
        <Flex direction='row' gap={1}>
          <Text fontSize={14} color='brandGray.600'>
            Start journaling at
          </Text>
          <Text fontSize={14} color='brand.600'>
            rosebud.app
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ExportYearStats
