import { Select, SelectProps } from '@chakra-ui/react'
import { hourAsLocalTimeString, Hours } from 'util/date'

type Props = {
  prefix?: string
  disabled?: boolean
} & SelectProps

const LocalTimeSelector = ({ prefix, disabled, ...props }: Props) => {
  return (
    <Select {...props} disabled={disabled}>
      {Hours.map((time, idx) => (
        <option value={idx} key={`time-${idx}`}>
          {prefix}
          {hourAsLocalTimeString(time)}
        </option>
      ))}
    </Select>
  )
}

export default LocalTimeSelector
