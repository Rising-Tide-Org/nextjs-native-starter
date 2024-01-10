import { Box, Textarea, Flex, Text } from '@chakra-ui/react'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import PersonalizationTipsPopover from 'ui/core/PersonalizationTipsPopover'
import { ReactNode, ChangeEvent } from 'react'
import ResizeTextarea from 'react-textarea-autosize'

type Props = {
  title: string
  placeholder: string
  popoverContent: ReactNode
  value: string
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  isError: boolean
  maxInputLength: number
}

const PersonalizationTextarea = ({
  title,
  placeholder,
  popoverContent,
  value,
  handleChange,
  isError,
  maxInputLength,
  ...props
}: Props) => {
  const errorColor = 'red.500'
  const textColor = 'brandGray.500'

  return (
    <Box>
      <Flex justify='space-between' align='center'>
        <SmallCapsHeading mb={0}>{title}</SmallCapsHeading>
        <PersonalizationTipsPopover title={title}>
          {popoverContent}
        </PersonalizationTipsPopover>
      </Flex>
      <Textarea
        as={ResizeTextarea}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        border='1px solid'
        p={3}
        minH='140px'
        borderColor={isError ? errorColor : textColor}
        _focus={{
          borderColor: isError ? errorColor : textColor,
        }}
        _placeholder={{ color: textColor }}
        resize='none'
        {...props}
      />
      <Text
        textAlign='right'
        color={isError ? errorColor : textColor}
        fontSize='14px'
        mt={1}
      >
        {`${value.length} / ${maxInputLength}`}
      </Text>
    </Box>
  )
}

export default PersonalizationTextarea
