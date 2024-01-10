import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useTheme,
  Box,
} from '@chakra-ui/react'
import { ComposeAidType } from 'types/Compose'
import { UserFlag } from 'types/User'
import CoachMark from 'ui/shared/CoachMark'
import { RbBolt } from 'ui/shared/Icon'

type Props = {
  onSelect: (type: ComposeAidType) => void
  isDisabled?: boolean
  disableCoachMark?: boolean
}

const ResponseActionAidButton = ({
  onSelect,
  isDisabled,
  disableCoachMark,
}: Props) => {
  const { colors, zIndices } = useTheme()
  return (
    <Menu placement='top-end' variant='control'>
      {({ isOpen }) => (
        <>
          <CoachMark
            flag={UserFlag.suggestionsTipSeen}
            delay={10000}
            prerequisites={[
              UserFlag.digDeeperTipSeen,
              UserFlag.finishEntryTipSeen,
            ]}
            isDisabled={disableCoachMark}
          >
            <MenuButton as={Box} cursor='pointer'>
              <IconButton
                variant='ghost'
                fontSize='14px'
                icon={
                  <RbBolt boxSize='20px' color={isOpen && colors.brand[500]} />
                }
                aria-label='Get suggestions'
                isDisabled={isDisabled}
              />
            </MenuButton>
          </CoachMark>
          <MenuList
            py={0}
            rounded='md'
            overflow='hidden'
            zIndex={zIndices.sticky + 1}
          >
            <MenuItem onClick={() => onSelect('nudge')} py={2}>
              Suggest ideas
            </MenuItem>
            <MenuDivider my={0} />
            <MenuItem onClick={() => onSelect('challenge')} py={2}>
              Challenge thinking
            </MenuItem>
            <MenuDivider my={0} />
            <MenuItem onClick={() => onSelect('perspective')} py={2}>
              Give alternative perspective
            </MenuItem>
            <MenuDivider my={0} />
            <MenuItem onClick={() => onSelect('traps')} py={2}>
              Scan for thinking traps
            </MenuItem>
            <MenuDivider my={0} />
            <MenuItem onClick={() => onSelect('reframe')} py={2}>
              Suggest positive reframe
            </MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default ResponseActionAidButton
