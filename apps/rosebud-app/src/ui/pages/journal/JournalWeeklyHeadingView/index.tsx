import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import moment from 'moment'
import { BiChevronRight } from 'react-icons/bi'
import { Analysis } from 'types/Analysis'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { RbClock } from 'ui/shared/Icon'

type Props = {
  week: string
  analysis?: Analysis
  entryCount: number
  isSelected: boolean
}

const JournalWeeklyHeadingView = ({
  week,
  analysis,
  entryCount,
  isSelected,
}: Props) => {
  const currentWeek = moment().format('YYYY-WW')
  const groupWeek = moment(week, 'GGGG-WW').format('YYYY-WW')
  const isCurrentWeek = currentWeek === groupWeek
  const bgColorSecondary = useColorModeValue('brandGray.100', 'transparent')
  const bgColorHover = useColorModeValue('brandGray.50', 'gray.900')
  const bgColorSecondaryHover = useColorModeValue('brandGray.50', 'gray.900')
  const textColor = useColorModeValue('blue.500', 'green.400')
  const borderColor = useColorModeValue('inherit', 'transparent')

  if (entryCount < 3 && !isCurrentWeek) {
    return null
  }

  return (
    <Panel
      mb={2}
      bg={isSelected ? 'bgSelected' : isCurrentWeek ? bgColorSecondary : 'bg'}
      borderColor={
        isSelected ? 'borderSelected' : isCurrentWeek ? 'border' : borderColor
      }
      cursor='pointer'
      _hover={{
        bg: isSelected
          ? 'bgSelected'
          : isCurrentWeek
          ? bgColorSecondaryHover
          : bgColorHover,
        borderColor: isSelected ? 'borderSelected' : 'inherit',
      }}
      _groupHover={{
        borderColor: isSelected ? 'borderSelected' : 'inherit',
      }}
    >
      {!isCurrentWeek && (
        <SmallCapsHeading fontSize='11px' mb={1} variant='secondary'>
          Weekly Reflection
        </SmallCapsHeading>
      )}
      <Flex
        w='full'
        justify={isCurrentWeek ? 'start' : 'space-between'}
        gap={2}
        align='center'
        fontSize='15px'
      >
        {isCurrentWeek ? (
          <>
            <RbClock boxSize='18px' />
            <Text>Weekly insights unlock Sunday</Text>
          </>
        ) : (
          <>
            {analysis ? (
              <>
                <Text fontWeight={500} fontSize='15px' noOfLines={2}>
                  {analysis.title}
                </Text>
                <Box as={BiChevronRight} size='20' flexShrink={0} />
              </>
            ) : (
              <>
                <Text color={textColor}>Weekly summary available</Text>
                <Box
                  as={BiChevronRight}
                  size='20'
                  flexShrink={0}
                  color={textColor}
                />
              </>
            )}
          </>
        )}
      </Flex>
    </Panel>
  )
}

export default JournalWeeklyHeadingView
