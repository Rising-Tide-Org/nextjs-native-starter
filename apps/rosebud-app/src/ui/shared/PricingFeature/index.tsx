import {
  Flex,
  FlexProps,
  Spacer,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { ElementType } from 'react'
import { RxCheck } from 'react-icons/rx'
import theme from 'styles/theme'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import HelpBubble from 'ui/core/HelpBubble'
import { RbCheckmarkAsterisk, RbLogo } from '../Icon'
import { CgLock } from 'react-icons/cg'

export type FeatureProps = FlexProps & {
  Icon?: ElementType
  content?: string
  isBloomOnly?: boolean
  isLimited?: boolean
  selectedBloom?: boolean
  header?: boolean
  tooltipLabel?: string
  iconBorderTopRadius?: boolean
  iconBorderBottomRadius?: boolean
}

const PricingFeature = ({
  Icon,
  content,
  isBloomOnly,
  isLimited,
  selectedBloom,
  header,
  tooltipLabel,
  iconBorderTopRadius,
  iconBorderBottomRadius,
  ...props
}: FeatureProps) => {
  const iconColor = useColorModeValue('brandGray.800', 'brandGray.200')
  const bgColorLite = useColorModeValue('brand.100', 'transparent')
  const bgColorBloom = useColorModeValue('bloom.100', 'transparent')
  const checkColorLite = useColorModeValue(
    theme.colors.red[700],
    theme.colors.brand[500]
  )
  const checkColorBloom = useColorModeValue(
    theme.colors.bloom[900],
    theme.colors.bloom[500]
  )
  const checkColorDeselected = useColorModeValue(
    theme.colors.brandGray[400],
    theme.colors.brandGray[700]
  )
  return (
    <Flex w={'full'} align='center' direction={'row'} {...props}>
      {Icon ? <Icon boxSize='20px' color={iconColor} /> : null}
      {header ? (
        <SmallCapsHeading mb={1}>Features</SmallCapsHeading>
      ) : (
        <Flex px={3} minW={0} gap={1.5}>
          <Text
            fontWeight={500}
            fontSize='17px'
            whiteSpace='nowrap'
            overflow='hidden'
            textOverflow='ellipsis'
          >
            {content}
          </Text>
          {tooltipLabel ? <HelpBubble label={tooltipLabel} /> : null}
        </Flex>
      )}
      <Spacer />
      <Flex gap={0} position='relative' w='80px' h='40px'>
        <Flex
          w='40px'
          h='40px'
          align='center'
          justifyContent='center'
          borderTopRadius={iconBorderTopRadius ? 'lg' : undefined}
          borderBottomRadius={iconBorderBottomRadius ? 'lg' : undefined}
          backgroundColor={
            !header
              ? !selectedBloom
                ? bgColorLite
                : 'transparent'
              : 'transparent'
          }
          style={{
            flexShrink: 0,
            transition: 'background-color 0.3s ease-out',
          }}
          zIndex='1'
        >
          {header ? (
            <RbLogo color='brand.500' />
          ) : isLimited ? (
            <RbCheckmarkAsterisk
              color={!selectedBloom ? checkColorLite : checkColorDeselected}
            />
          ) : isBloomOnly ? (
            <CgLock
              color={!selectedBloom ? checkColorLite : checkColorDeselected}
            />
          ) : (
            <RxCheck
              color={!selectedBloom ? checkColorLite : checkColorDeselected}
              size={24}
            />
          )}
        </Flex>
        <Flex
          w='40px'
          h='40px'
          align='center'
          justifyContent='center'
          borderTopRadius={iconBorderTopRadius ? 'lg' : undefined}
          borderBottomRadius={iconBorderBottomRadius ? 'lg' : undefined}
          backgroundColor={
            !header
              ? selectedBloom
                ? bgColorBloom
                : 'transparent'
              : 'transparent'
          }
          style={{
            flexShrink: 0,
            transition: 'background-color 0.3s ease-out',
          }}
          zIndex='1'
        >
          {header ? (
            <RbLogo color='bloom.500' />
          ) : (
            <RxCheck
              color={selectedBloom ? checkColorBloom : checkColorDeselected}
              size={24}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default PricingFeature
