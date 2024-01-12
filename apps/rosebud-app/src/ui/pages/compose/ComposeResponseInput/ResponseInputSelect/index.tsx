import { Flex } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ComposeResponse } from 'types/Compose'
import { kOptionSlideInTransition } from 'shared/ui/constants'
import MotionBox from 'shared/ui/core/MotionBox'
import ResponseInputSelectOption from '../ResponseInputSelectOption'

type Props = {
  response: ComposeResponse
}

const ResponseInputSelect = ({ response }: Props) => {
  const { updateActiveResponse, activeResponse } = useComposeProvider()

  // For use storing the custom "Other" option
  const [otherOption, setOtherOption] = useState('')

  /**
   * Initialize the "Other" option if it exists in the draft
   */
  useEffect(() => {
    if (response.prompt.showOtherOption && activeResponse && !otherOption) {
      // Find options that are not in the prompt options
      const otherOptions = activeResponse.response.filter(
        (r) => !response.prompt.options?.includes(r)
      )

      if (
        otherOptions.length > 0 &&
        otherOptions[0] !== response.prompt.noneOption
      ) {
        setOtherOption(otherOptions[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResponse])

  /**
   * Handles selecting a regular option
   */
  const handleSelect = useCallback(
    (option: string) => {
      if (!activeResponse) {
        return
      }
      // If the option is already selected, remove it
      if (activeResponse?.response.includes(option)) {
        updateActiveResponse(
          activeResponse.response.filter((item) => item !== option)
        )
        return
      }
      // Otherwise, if its a single select or none option, replace the response
      if (
        response.prompt.input === 'select' ||
        option === response.prompt.noneOption
      ) {
        updateActiveResponse([option])
      } else if (response.prompt.input === 'multi-select') {
        // If multi-select, add the option to the response and deselect the none option
        let newResponse = [...activeResponse.response, option]

        // If there is a max selection, remove the first item
        if (response.prompt.maxSelections) {
          newResponse = newResponse.slice(-response.prompt.maxSelections)
        }

        updateActiveResponse(
          newResponse.filter(
            (r) =>
              !response.prompt.noneOption ||
              !r.includes(response.prompt.noneOption)
          )
        )
      }
    },
    [activeResponse, response, updateActiveResponse]
  )

  /**
   * Handles selecting the "Other" option
   */
  const handleSelectOtherOption = useCallback(
    (value: string) => {
      if (!activeResponse) {
        return
      }
      if (!activeResponse.response.includes(value)) {
        handleSelect(value)
      }
      if (!value) {
        setOtherOption('')
        updateActiveResponse(
          activeResponse?.response.filter((r) => r !== otherOption)
        )
      } else {
        setOtherOption(value)
      }
    },
    [activeResponse, handleSelect, otherOption, updateActiveResponse]
  )

  const options = useMemo(() => {
    let options = response.prompt.options ?? []
    if (response.prompt.shouldShuffleOptions) {
      options = response.prompt.options?.sort(() => Math.random() - 0.5) ?? []
    }
    if (response.prompt.noneOption) {
      options = [...options, response.prompt.noneOption]
    }
    return options
  }, [response.prompt])

  if (!activeResponse) {
    return null
  }

  return (
    <AnimatePresence>
      <Flex direction='column' flexWrap='wrap' gap={2}>
        {options?.map((option, i) => (
          <MotionBox
            key={option}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={kOptionSlideInTransition(i)}
          >
            <ResponseInputSelectOption
              data-testid={`compose-response-input-option-${i}`}
              selected={activeResponse.response.includes(option)}
              onChoose={() => handleSelect(option)}
            >
              {option}
            </ResponseInputSelectOption>
          </MotionBox>
        ))}
        {response.prompt.showOtherOption && (
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={kOptionSlideInTransition(options.length)}
          >
            <ResponseInputSelectOption
              selected={activeResponse.response.includes(otherOption)}
              onChoose={handleSelectOtherOption}
              isOther
              otherValue={otherOption}
            >
              Other
            </ResponseInputSelectOption>
          </MotionBox>
        )}
      </Flex>
    </AnimatePresence>
  )
}

export default ResponseInputSelect
