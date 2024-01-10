import {
  Box,
  Button,
  Divider,
  PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
  useTheme,
} from '@chakra-ui/react'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { DayPicker, Matcher } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

const getCss = (theme: any, isDarkMode: boolean) => `
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
    background-color: ${
      isDarkMode ? theme.colors.gray[800] : theme.colors.brandGray[100]
    } !important;
  }
  .rdp-button:hover:not([disabled]) {
    /* This is brand color with opacity */
    background-color: ${
      isDarkMode ? theme.colors.gray[800] : theme.colors.brandGray[100]
    } !important;
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
    background: ${
      isDarkMode ? theme.colors.gray[800] : theme.colors.brandGray[100]
    }
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
  value: string
  onChange: (value?: string) => void
  children: React.ReactNode
  closeOnChange?: boolean
  placement?: PlacementWithLogical
  disabled?: Matcher[]
}

const DatePicker = ({
  value,
  onChange,
  children,
  closeOnChange,
  placement,
  disabled = [],
}: Props) => {
  const theme = useTheme()
  const { colorMode } = useColorMode()
  const css = getCss(theme, colorMode === 'dark')
  const [date, setDate] = useState<string | undefined>(value)
  const [isOpen, setIsOpen] = useState<boolean | undefined>()

  const handleChange = useCallback(
    (day: Date | undefined) => {
      const localDate = day?.toLocaleDateString() || ''
      setDate(localDate)

      const responseDate = day instanceof Date ? day.toISOString() : undefined

      if (closeOnChange) {
        setIsOpen(false)
      }

      onChange(responseDate)
    },
    [closeOnChange, onChange]
  )

  const handleOnOpen = useCallback(() => {
    setIsOpen(true)
  }, [])
  const handleOnClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const dateValue = date && date?.length > 0 ? moment(date).toDate() : undefined
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
        <PopoverContent zIndex={theme.zIndices.sticky} overflow='hidden'>
          <PopoverArrow />
          <PopoverBody p={0} bg='bg'>
            <Box px={2} pt={2}>
              <DayPicker
                mode='single'
                showOutsideDays
                fixedWeeks
                selected={dateValue}
                onSelect={handleChange}
                modifiersClassNames={{
                  selected: 'dp-selected',
                  today: 'dp-today',
                }}
                disabled={disabled}
              />
            </Box>
            <Divider mt={3} />
            <Button
              onClick={handleOnClose}
              alignSelf='center'
              w='full'
              variant='ghost'
              fontWeight='normal'
            >
              Close
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default DatePicker
