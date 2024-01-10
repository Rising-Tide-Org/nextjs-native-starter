import {
  Box,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react'
import { useState } from 'react'
import { HiEyeOff } from 'react-icons/hi'
import { HiEye } from 'react-icons/hi2'
import { kPasswordMinLength } from 'util/form'

const PasswordEntry = (props: InputProps) => {
  const [show, setShow] = useState(false)
  const handleClick = () => setShow(!show)

  return (
    <Box w='full'>
      <InputGroup size='md'>
        <Input
          name='password'
          p={2}
          pl={3}
          pr='70px'
          size='lg'
          minLength={kPasswordMinLength}
          type={show ? 'text' : 'password'}
          placeholder='Password'
          autoComplete='password'
          data-testid='password-input'
          {...props}
        />
        <InputRightElement pr={1} h='full'>
          <IconButton
            variant='ghost'
            h='full'
            size='lg'
            onClick={handleClick}
            icon={show ? <HiEye size={16} /> : <HiEyeOff size={16} />}
            aria-label='Toggle'
            color={show ? 'blue.500' : 'brandGray.500'}
            _hover={{
              color: show ? 'blue.600' : 'brandGray.700',
            }}
            _active={{
              bg: 'none',
            }}
          />
        </InputRightElement>
      </InputGroup>
    </Box>
  )
}

export default PasswordEntry
