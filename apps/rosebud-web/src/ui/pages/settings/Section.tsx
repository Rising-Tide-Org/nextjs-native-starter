import {
  Heading,
  HStack,
  Box,
  StackProps,
  Spacer,
  BoxProps,
} from '@chakra-ui/react'
import Panel from 'ui/core/Panel'

type Props = {
  children: React.ReactNode
  icon: React.ReactNode
  title: string
  rightElement?: React.ReactNode
} & StackProps

const Section = ({ children, icon, title, rightElement, ...props }: Props) => {
  return (
    <Panel width='100%' p={1} {...props}>
      <SectionTitle icon={icon} rightElement={rightElement}>
        {title}
      </SectionTitle>
      {children}
    </Panel>
  )
}

export default Section

type SectionTitleProps = {
  icon?: React.ReactNode
  children: React.ReactNode
  rightElement?: React.ReactNode
} & StackProps

export const SectionTitle = ({
  icon,
  children,
  rightElement,
  ...props
}: SectionTitleProps) => {
  return (
    <HStack pt={4} px={4} width='100%' align='center' {...props}>
      {icon}
      <Heading fontSize='16px' fontWeight={600}>
        {children}
      </Heading>
      <Spacer />
      {rightElement}
    </HStack>
  )
}

export const SectionBody = ({ children, ...rest }: BoxProps) => {
  return (
    <Box width='full' p={4} {...rest}>
      {children}
    </Box>
  )
}
