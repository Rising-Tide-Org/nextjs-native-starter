import { Flex, Heading } from '@chakra-ui/react'
import moment from 'moment'
import { RbCalendarStroke } from 'ui/shared/Icon'

const DateHeading = () => (
  <Flex align='center' flex={1} gap={2} justify='center'>
    <RbCalendarStroke
      display={{ base: 'none', md: 'inline-block' }}
      boxSize='20px'
    />
    <Heading fontSize='inherit' fontWeight='inherit'>
      {moment().format('dddd, MMM Do')}
    </Heading>
  </Flex>
)

export default DateHeading
