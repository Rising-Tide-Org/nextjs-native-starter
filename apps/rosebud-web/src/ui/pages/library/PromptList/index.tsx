import { LinkOverlay, IconButton, Text, Grid, Box } from '@chakra-ui/react'
import router from 'next/router'
import { usePromptProvider } from 'providers/PromptProvider'
import { UserFlag } from 'types/User'
import CoachMark from 'ui/shared/CoachMark'
import { RbBookmarkFill, RbBookmark } from 'ui/shared/Icon'
import NextLink from 'next/link'
import navigator from 'lib/routes'
import { Prompt } from 'types/Prompt'
import Panel from 'ui/core/Panel'

type Props = {
  prompts?: Prompt[]
}
const PromptList = ({ prompts }: Props) => {
  const { toggleBookmark } = usePromptProvider()

  return (
    <Grid
      gridTemplateColumns={{
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(2, 1fr)',
        xl: 'repeat(2, 1fr)',
      }}
      gridGap={1}
    >
      {prompts?.map((prompt, index) => (
        <Panel
          key={prompt.id}
          variant='vstack'
          cursor='pointer'
          w='full'
          textAlign='left'
          p={{ base: 4, md: 6 }}
          _hover={{
            base: {},
            md: {
              borderColor: 'inherit',
            },
          }}
          position='relative'
          data-testid='prompt-list-item'
          role='group'
        >
          <>
            <LinkOverlay
              as={NextLink}
              href={navigator.composePrompt(prompt.id, router.asPath)}
              passHref
              shallow
              pr={4}
            >
              <Text>{prompt.question}</Text>
            </LinkOverlay>
            <Box top={0} right={0} position='absolute'>
              <CoachMark
                flag={UserFlag.bookmarkTipSeen}
                isDisabled={index !== 0}
                offset={[0, 10]}
              >
                <IconButton
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
                  size='md'
                  onClick={() => toggleBookmark(prompt)}
                />
              </CoachMark>
            </Box>
          </>
        </Panel>
      ))}
    </Grid>
  )
}

export default PromptList
