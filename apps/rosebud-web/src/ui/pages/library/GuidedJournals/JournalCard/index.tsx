import {
  Flex,
  Tag,
  Spacer,
  Text,
  Box,
  FlexProps,
  useColorMode,
} from '@chakra-ui/react'
import { illustrationToTemplateIdMap } from 'constants/templates'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ComposeTemplateMetadata } from 'types/Compose'
import Panel from 'ui/core/Panel'
import { useWindowSize } from 'usehooks-ts'

type Props = FlexProps & {
  journal: ComposeTemplateMetadata
}

const JournalCard = ({ journal, ...props }: Props) => {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [textHeight, setTextHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const windowSize = useWindowSize()
  const { colorMode } = useColorMode()

  /**
   * Track the height of the text and container for animation purposes
   */
  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.clientHeight)
    }
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight)
    }
  }, [textRef, containerRef, windowSize])

  const handleClick = () => {
    router.push(`/compose/${journal.templateId}?returnTo=${router.asPath}`)
  }

  const IllustrationSvg = useMemo(() => {
    return illustrationToTemplateIdMap[journal.templateId]
  }, [journal.templateId])

  return (
    <Panel
      ref={containerRef}
      variant='vstack'
      h='240px'
      cursor='pointer'
      _hover={{
        base: {},
        md: {
          borderColor: 'inherit',
          '.image': {
            opacity: 0,
            transform: 'scale(0.3) translateY(-100px)',
          },
          '.text': {
            transform: `translateY(-${containerHeight - textHeight - 100}px)`, // Adjust as necessary to get the desired top spacing during hover
          },
          '.description': {
            opacity: 1,
          },
        },
      }}
      p={4}
      onClick={handleClick}
      transition='all 0.3s'
      transitionDelay='0.1s'
      overflow='hidden'
      {...props}
    >
      {journal.tags && (
        <Flex>
          {journal.tags.map((tag) => (
            <Tag key={tag} size='sm'>
              {tag}
            </Tag>
          ))}
        </Flex>
      )}
      <Spacer />
      <IllustrationSvg
        p={2}
        colorMode={colorMode}
        fill='none'
        className='image'
        objectFit='contain'
        w='100%'
        h='auto'
        maxH='100px'
        transition='inherit'
        transitionDelay='inherit'
      />
      <Spacer />
      <Box
        className='text'
        transition='all 0.3s'
        transitionDelay='inherit'
        w='full'
      >
        <Text
          fontWeight={500}
          fontSize='17px'
          lineHeight='1.4rem'
          w='90%'
          ref={textRef}
        >
          {journal.name}
        </Text>
        <Text
          fontSize='14px'
          className='description'
          opacity={0}
          transition='inherit'
          transitionDelay='inherit'
          position='absolute'
          variant='secondary'
          w='fit-content'
          mt={2}
        >
          {journal.description}
        </Text>
      </Box>
      <Text
        fontSize='13px'
        variant='tertiary'
        zIndex={1}
        bg='bg'
        alignSelf='baseline'
        pr={4}
      >
        {journal.minutes} min
      </Text>
    </Panel>
  )
}

export default JournalCard
