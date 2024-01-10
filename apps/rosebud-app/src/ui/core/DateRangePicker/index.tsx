import {
  Box,
  Button,
  Divider,
  Flex,
  PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useTheme,
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { DateRange, DayPicker, Matcher } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

const getCss = (theme: any) => `
  .dp-selected:not([disabled]) { 
    font-weight: bold; 
    border: 1px solid ${theme.colors.brand[500]};
    color: ${theme.colors.brand[500]};
  }
  .dp-selected:hover:not([disabled]) { 
    border-color: ${theme.colors.brand[500]};
    color: ${theme.colors.brand[600]};
  }
  .dp-today { 
    font-weight: bold;
  }
  .rdp-day {
    width: 36px;
    height: 36px;
  }
  .rdp {
    margin: 0;
  }
  .rdp-table,
  .rdp-month {
    width: 100%;
    max-width: 100%;
  }
  .rdp-nav_button_previous:hover:not([disabled]),
  .rdp-nav_button_next:hover:not([disabled]) {
    /* This is brand color with opacity */
    background-color: ${theme.colors.brandGray[100]} !important;
  }
  .rdp-button:hover:not([disabled]) {
    /* This is brand color with opacity */
    background-color: ${theme.colors.brandGray[100]} !important;
  }
  .rdp-nav_icon {
    width: 12px;
    height: 12px;
  }
  .rdp-nav_button {
    width: 36px;
    height: 36px;
  }
  .rdp-head_row {
    background: ${theme.colors.brandGray[100]}
  }
  .rdp-head_cell {
    height: 24px;
  }
  .rdp-table {
    margin-top: 8px;
  }
`

type Props = {
  // Important: DatePicker value come in as string because they are more common
  // to handle in forms, and it makes memoization easier
  onChange: (range?: DateRange) => void
  children: React.ReactNode
  placement?: PlacementWithLogical
  disabled?: Matcher[]
  mode?: 'single' | 'range'
}

const DateRangePicker = ({
  onChange,
  children,
  placement,
  disabled = [],
}: Props) => {
  const theme = useTheme()
  const css = getCss(theme)
  const [isOpen, setIsOpen] = useState<boolean | undefined>()
  const [range, setRange] = useState<DateRange | undefined>()

  useEffect(() => {
    onChange(range)
  }, [range, onChange])

  const handleOnOpen = useCallback(() => {
    setIsOpen(true)
  }, [])
  const handleOnClose = useCallback(() => {
    setIsOpen(false)
  }, [])
  const handleOnClear = useCallback(() => {
    setRange(undefined)
  }, [])

  return (
    <>
      <style>{css}</style>
      <Popover
        isOpen={isOpen}
        onOpen={handleOnOpen}
        onClose={handleOnClose}
        placement={placement}
        closeOnEsc={false}
      >
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent zIndex={theme.zIndices.sticky}>
          <PopoverArrow />
          {/* TODO: Figure out z-index issue with footer */}
          <PopoverBody p={0}>
            <Box px={2} pt={2}>
              <DayPicker
                mode='range'
                showOutsideDays
                fixedWeeks
                selected={range}
                onSelect={setRange}
                modifiersClassNames={{
                  selected: 'dp-selected',
                  today: 'dp-today',
                }}
                disabled={disabled}
              />
            </Box>
            <Divider mt={3} />
            <Flex direction={'row'} w='full'>
              <Box borderRight={'1px'} borderColor={'brandGray.100'} w='full'>
                <Button
                  onClick={handleOnClear}
                  alignSelf='center'
                  w='full'
                  variant='ghost'
                  fontWeight='normal'
                  color={'brand.600'}
                >
                  Clear
                </Button>
              </Box>
              <Box w='full'>
                <Button
                  onClick={handleOnClose}
                  alignSelf='center'
                  w='full'
                  variant='ghost'
                  fontWeight='normal'
                >
                  Done
                </Button>
              </Box>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default DateRangePicker
