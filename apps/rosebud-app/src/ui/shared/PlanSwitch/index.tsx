import { Box, Button, Flex, FlexProps, Text } from '@chakra-ui/react'
import { kProductPackages } from 'constants/premium'
import { motion } from 'framer-motion'
import Analytics from 'lib/analytics'
import { useMemo, useState } from 'react'
import theme from 'styles/theme'
import { PriceInterval } from 'types/Subscription'
import { RbLogo } from '../Icon'

type Props = FlexProps & {
  onPlanChange: (isBloom: boolean) => void
  priceInterval: PriceInterval
  showDiscountedPrice: boolean
}

const AnimatedBackground = motion(Box)

const PlanSwitch = ({
  onPlanChange,
  priceInterval,
  showDiscountedPrice,
  ...props
}: Props) => {
  const [selectedBloom, setSelectedBloom] = useState(true)

  const handlePlanSelect = (isBloom: boolean) => {
    setSelectedBloom(isBloom)
    onPlanChange(isBloom)

    Analytics.trackEvent('subscription.upgrade.select', {
      plan: isBloom ? 'bloom' : 'lite',
    })
  }

  const litePrice =
    kProductPackages['lite'].pricePackages[priceInterval][
      showDiscountedPrice ? 1 : 0
    ]?.price
  const litePriceLabel = `$${litePrice}/${
    priceInterval === 'monthly' ? 'mo' : 'yr'
  }`

  const bloomPrice =
    kProductPackages['bloom'].pricePackages[priceInterval][
      showDiscountedPrice ? 1 : 0
    ]?.price
  const bloomPriceLabel = `$${bloomPrice}/${
    priceInterval === 'monthly' ? 'mo' : 'yr'
  }`

  const x = useMemo(() => (selectedBloom ? '100%' : 0), [selectedBloom])
  const backgroundColor = useMemo(
    () => (selectedBloom ? theme.colors.bloom[500] : theme.colors.brand[500]),
    [selectedBloom]
  )

  return (
    <Flex
      position='relative'
      width='full'
      height='60px'
      border='1px solid'
      borderColor='inherit'
      bg='bg'
      borderRadius='lg'
      {...props}
    >
      <AnimatedBackground
        position='absolute'
        top='3px'
        left='3px'
        width='calc(50% - 3px)'
        height='calc(100% - 6px)'
        rounded='md'
        animate={{ x, backgroundColor }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
      />
      <Button
        flex='1'
        bg='transparent'
        height='full'
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        onClick={() => handlePlanSelect(false)}
        zIndex='1'
        gap={1.5}
        color={selectedBloom ? theme.colors.brand[500] : 'white'}
      >
        <Flex direction='column' gap='2px' align='center'>
          <Flex direction='row' gap={1} align='center'>
            <RbLogo color='inherit' boxSize='15px' />
            <Text>Premium</Text>
          </Flex>
          {litePrice ? (
            <Text
              fontWeight={400}
              fontSize={11.5}
              px={1}
              ml={1}
              color={selectedBloom ? theme.colors.brand[500] : 'white'}
            >
              {litePriceLabel}
            </Text>
          ) : null}
        </Flex>
      </Button>
      <Button
        flex='1'
        bg='transparent'
        height='full'
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        onClick={() => handlePlanSelect(true)}
        zIndex='1'
        gap={1.5}
        color={selectedBloom ? 'white' : theme.colors.bloom[500]}
      >
        <Flex direction='column' gap='2px' align='center'>
          <Flex direction='row' gap={1} align='center'>
            <RbLogo
              boxSize='15px'
              color={selectedBloom ? 'white' : theme.colors.bloom[500]}
            />
            <Text>Bloom</Text>
          </Flex>
          {bloomPrice ? (
            <Text
              fontWeight={400}
              fontSize={11.5}
              px={1}
              ml={1}
              color={!selectedBloom ? theme.colors.bloom[500] : 'white'}
            >
              {bloomPriceLabel}
            </Text>
          ) : null}
        </Flex>
      </Button>
    </Flex>
  )
}

export default PlanSwitch
