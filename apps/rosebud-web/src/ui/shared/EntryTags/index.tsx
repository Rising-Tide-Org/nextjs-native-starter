import {
  Flex,
  FlexProps,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tooltip,
} from '@chakra-ui/react'
import { BsFillPersonFill } from 'react-icons/bs'
import { Entities } from 'types/Entry'
import { ucFirst } from 'util/string'

type Props = FlexProps & {
  entities: Entities
}

const EntryTags = ({ entities, ...props }: Props) => {
  const hasPeople = Boolean(entities?.people?.length)
  const hasTopics = Boolean(entities?.topics?.length)
  const hasEmotions = Boolean(entities?.emotions?.length)
  return (
    <Flex gap={1} flexWrap='wrap' {...props}>
      {hasPeople &&
        entities?.people?.map((person, index) => (
          <Tooltip label={person.relation} key={index}>
            <Tag
              size='md'
              bg='transparent'
              color='brandGray.700'
              border='1px solid'
              borderColor='brandGray.200'
              fontWeight={450}
              data-sentry-block
            >
              <TagLeftIcon as={BsFillPersonFill} mr={1} />
              <TagLabel>{ucFirst(person.name)}</TagLabel>
            </Tag>
          </Tooltip>
        ))}
      {hasTopics &&
        entities?.topics?.map((topic, index) => (
          <Tag
            key={index}
            size='md'
            bg='transparent'
            color='brandGray.700'
            border='1px solid'
            borderColor='brandGray.200'
            fontWeight={450}
            data-sentry-block
          >
            {topic}
          </Tag>
        ))}

      {hasEmotions &&
        entities?.emotions?.map((entity, index) => (
          <Tag
            key={index}
            size='md'
            fontWeight={450}
            color='brandGray.700'
            bg='transparent'
            border='1px solid'
            borderColor='brandGray.200'
            data-sentry-block
          >
            {entity.emoji?.toLowerCase()} {ucFirst(entity.label)}
          </Tag>
        ))}
    </Flex>
  )
}

export default EntryTags
