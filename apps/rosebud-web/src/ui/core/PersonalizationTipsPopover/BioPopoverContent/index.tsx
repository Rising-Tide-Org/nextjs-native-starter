import { Flex, ListItem, UnorderedList } from '@chakra-ui/react'

const BioPopoverContent = () => (
  <Flex
    direction='column'
    px={1}
    pt={4}
    pb={1}
    fontSize='15px'
    color='brandGray.200'
  >
    <UnorderedList lineHeight='1.7'>
      <ListItem>Where do you live and what do you do?</ListItem>
      <ListItem>Who are your important relationships?</ListItem>
      <ListItem>What goals are you working towards?</ListItem>
      <ListItem>What are your core beliefs and values?</ListItem>
    </UnorderedList>
  </Flex>
)

export default BioPopoverContent
