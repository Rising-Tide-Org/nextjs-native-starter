import {
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { TimestampRange } from 'types/EntryVector'

type Props = {
  onChange: (range: TimestampRange) => void
}

enum DateRangePreset {
  Week = 'Past week',
  Month = 'Past month',
  All = 'All-time',
}

const DateRangeMenu = ({ onChange }: Props) => {
  const [dateRange, setDateRange] = useState<DateRangePreset>(
    DateRangePreset.All
  )

  const handleSelectPreset = (preset: DateRangePreset) => {
    let after: number | undefined = undefined
    switch (preset) {
      case DateRangePreset.Week:
        after = moment().subtract(1, 'week').unix()
        break
      case DateRangePreset.Month:
        after = moment().subtract(1, 'month').unix()
        break
      default:
        after = undefined
    }
    setDateRange(preset)
    onChange({
      after,
    })
  }

  return (
    <Menu placement='bottom-end'>
      <MenuButton
        as={Flex}
        flexDirection='row'
        alignItems='center'
        cursor='pointer'
        color={'gray.300'}
        fontWeight={600}
        rounded='md'
      >
        <Flex
          direction='row'
          justifyContent='center'
          alignItems='end'
          gap={0.5}
        >
          <Text fontSize='12px'>{dateRange}</Text>
          <FiChevronDown />
        </Flex>
      </MenuButton>
      <MenuList mt={0} py={0} rounded='md' overflow='hidden' zIndex={3}>
        {Object.values(DateRangePreset).map((preset, index) => (
          <Fragment key={index}>
            <MenuItem
              onClick={() => handleSelectPreset(preset)}
              py={2}
              color={dateRange === preset ? 'brand.500' : 'inherit'}
              gap={1.5}
            >
              {preset}
            </MenuItem>
            <MenuDivider my={0} />
          </Fragment>
        ))}
      </MenuList>
    </Menu>
  )
}

export default DateRangeMenu
