import { Flex, Tag, IconButton, Text } from '@chakra-ui/react'
import routes from 'lib/routes'
import { useRouter } from 'next/router'
import { usePromptProvider } from 'providers/PromptProvider'
import { useCallback } from 'react'
import { Prompt } from 'types/Prompt'
import Panel from 'ui/core/Panel'
import { RbBookmarkFill, RbBookmark, RbPencil } from 'ui/shared/Icon'

type Props = {
  prompt: Prompt
  size?: 'sm' | 'md'
  showBookmark?: boolean
}

const PromptCard = ({ prompt, size = 'md', showBookmark = true }: Props) => {
  const router = useRouter()
  const { toggleBookmark } = usePromptProvider()

  const handleSelectPrompt = useCallback(
    (prompt: Prompt) => {
      router.push(routes.composePrompt(prompt.id, router.asPath), undefined, {
        shallow: true,
      })
    },
    [router]
  )

  return (
    <Panel
      w='240px'
      h={size === 'sm' ? '240px' : 'full'}
      // fontSize={size === 'sm' ? '15px' : '16px'}
      fontWeight={size === 'sm' ? 450 : 500}
      role='group'
      cursor='pointer'
      onClick={() => handleSelectPrompt(prompt)}
    >
      <Flex h='full' direction='column' justify='space-between'>
        <Flex pb={5} justify='space-between' align='top'>
          <Tag size='sm' h='fit-content'>
            For you
          </Tag>

          {showBookmark && (
            <IconButton
              position='absolute'
              top={3}
              right={3}
              icon={
                prompt.isBookmarked ? (
                  <RbBookmarkFill boxSize='18px' color='brand.500' />
                ) : (
                  <RbBookmark
                    boxSize='17px'
                    color='brandGray.400'
                    _hover={{ color: 'brandGray.500' }}
                    transition='color 0.1s linear'
                  />
                )
              }
              aria-label='Bookmark'
              variant='ghost'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                toggleBookmark(prompt)
              }}
            />
          )}
        </Flex>
        <Text lineHeight='1.5rem'>{prompt.question}</Text>
        <IconButton
          icon={<RbPencil boxSize='18px' />}
          w='fit-content'
          aria-label='Write'
          onClick={() => handleSelectPrompt(prompt)}
          opacity={{ base: 1, md: 0 }}
          _groupHover={{ opacity: 1 }}
        />
      </Flex>
    </Panel>
  )
}

export default PromptCard
