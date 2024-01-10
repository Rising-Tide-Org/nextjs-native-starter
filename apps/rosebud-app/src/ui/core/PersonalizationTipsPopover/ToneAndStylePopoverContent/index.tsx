import { Flex, ListItem, UnorderedList } from '@chakra-ui/react'

const ToneAndStylePopoverContent = () => (
  <Flex
    direction='column'
    px={1}
    pt={4}
    pb={1}
    fontSize='15px'
    color='brandGray.200'
  >
    <UnorderedList lineHeight='1.7'>
      <ListItem>Casual or more formal?</ListItem>
      <ListItem>Empathic or tough-love?</ListItem>
      <ListItem>Open-ended or problem-solving?</ListItem>
      <ListItem>Analytical and fact based?</ListItem>
    </UnorderedList>
  </Flex>
)

export default ToneAndStylePopoverContent
