import {
  Flex,
  Text,
  Button,
  Spacer,
  Box,
  Tag,
  Circle,
  useColorMode,
} from '@chakra-ui/react'
import { illustrationToTemplateIdMap } from 'constants/templates'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { ComposeTemplateMetadata } from 'types/Compose'
import Panel from 'ui/core/Panel'
import { RbCheckmark, RbPencil } from 'ui/shared/Icon'

type Props = {
  journal: ComposeTemplateMetadata
  completed: boolean
}

const DailyEntryCard = ({ journal, completed }: Props) => {
  const router = useRouter()
  const { colorMode } = useColorMode()

  const handleClick = () => {
    router.push(`/compose/${journal.templateId}?returnTo=${router.asPath}`)
  }

  const IllustrationSvg = useMemo(() => {
    return illustrationToTemplateIdMap[journal.templateId]
  }, [journal.templateId])

  return (
    <Panel
      variant='vstack'
      h='270px'
      transition='all 0.3s'
      transitionDelay='0.1s'
      overflow='hidden'
      w={{
        base: completed ? '240px' : '87vw',
        md: completed ? '240px' : 'full',
      }}
    >
      <IllustrationSvg
        colorMode={colorMode}
        className='image'
        objectFit='contain'
        h={{ base: '70px', md: '114px' }}
        w={{ base: '70px', md: '114px' }}
        transition='inherit'
        transitionDelay='inherit'
        position='absolute'
        right={6}
        top={4}
        zIndex={0}
        display={completed ? 'none' : 'block'}
      />

      <Flex pb={5}>
        <Tag size='sm'>Daily check-in</Tag>
      </Flex>

      <Box zIndex={1}>
        <Text
          fontWeight={500}
          fontSize='20px'
          lineHeight='1.7rem'
          w='90%'
          pt={1}
          mb={3}
        >
          {journal.name}
        </Text>

        {completed && (
          <Flex direction='column' gap={1} data-testid='entry-complete-cta'>
            <Flex align='center' gap={2}>
              <Circle bg='green.500' color='white' size={4}>
                <RbCheckmark boxSize='10px' />
              </Circle>
              <Text fontWeight={500}>Completed</Text>
            </Flex>
          </Flex>
        )}
      </Box>

      {completed ? (
        <>
          <Spacer />
          <Text color='brandGray.500'>
            Next check-in:{' '}
            {journal.templateId === 'morning-intention'
              ? 'Tonight'
              : 'Tomorrow morning'}{' '}
          </Text>
        </>
      ) : (
        <Text color='brandGray.500' w='70%'>
          {journal.description}
        </Text>
      )}

      {!completed && (
        <>
          <Spacer />
          <Flex justify='space-between' align='end'>
            <Button
              variant='primary'
              onClick={handleClick}
              aria-label={''}
              leftIcon={<RbPencil boxSize='18px' />}
              minW={{ base: 'auto', md: '240px' }}
              w={{ base: '100%', md: 'auto' }}
              size='lg'
            >
              Check in now
            </Button>
          </Flex>
        </>
      )}
    </Panel>
  )
}

export default DailyEntryCard
