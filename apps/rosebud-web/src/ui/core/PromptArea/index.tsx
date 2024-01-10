import ResizeTextarea from 'react-textarea-autosize'
import { Box, ChakraProps, Text, Textarea } from '@chakra-ui/react'
import { memo, ReactNode, useEffect, useRef, useState } from 'react'
import React from 'react'

const PromptArea = ({
  children,
  ...props
}: { children: ReactNode } & ChakraProps) => {
  return (
    <Box w='100%' position='relative' {...props}>
      {children}
    </Box>
  )
}

export const PromptAreaLabel = ({
  children,
  textProps,
  ...props
}: { children: ReactNode; textProps?: ChakraProps } & ChakraProps) => {
  return (
    <Box
      bg='brandGray.100'
      px={2}
      py={1}
      w='fit-content'
      rounded='md'
      fontSize='14px'
      lineHeight='1.33'
      fontWeight={500}
      color='brandGray.700'
      {...props}
    >
      <Text
        fontSize='14px'
        fontWeight={500}
        color='brandGray.600'
        lineHeight='130%'
        {...textProps}
      >
        {children}
      </Text>
    </Box>
  )
}

type PromptAreaTextProps = {
  placeholder?: string
  initialValue?: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  autoFocus?: boolean
  index?: number
  minRows?: number
} & ChakraProps

// eslint-disable-next-line react/display-name
export const PromptAreaText = memo((props: PromptAreaTextProps) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { index, initialValue, onChange, ...rest } = props
  const [value, setValue] = useState(initialValue || '')

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    onChange(e)
  }

  const handleFocus = () => {
    if (ref.current) {
      ref.current.focus()
      ref.current.selectionStart = ref.current?.value.length
    }
  }

  useEffect(() => {
    if (props.autoFocus && ref.current) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: index === 0 ? 'nearest' : 'start',
      })
      handleFocus()
    }
  }, [index, props.autoFocus])

  return (
    <Box pb={6} onClick={handleFocus} cursor='text'>
      <Textarea
        value={value}
        as={ResizeTextarea}
        ref={ref}
        w='100%'
        overflow='hidden'
        border={0}
        p={0}
        px={1}
        my={2}
        minRows={1}
        resize='none'
        minH='unset'
        data-sentry-block
        onChange={handleOnChange}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      />
    </Box>
  )
})

export default PromptArea
