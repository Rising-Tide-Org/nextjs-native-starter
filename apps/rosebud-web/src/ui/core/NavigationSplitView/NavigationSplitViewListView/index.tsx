import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useNavigationProvider } from 'shared/providers/NavigationProvider'
import { useCallback } from 'react'
import { Identifiable } from 'types/Generic'
import { ListView } from 'ui/core/ListView'
import ListViewHeading from 'ui/core/ListView/ListViewHeading'
import { ListViewItem } from 'ui/core/ListView/ListViewItem'
import Panel from 'ui/core/Panel'
import { NavigationSplitViewProps } from '../common'

type ListViewProps<T extends Identifiable> = NavigationSplitViewProps<T> & {
  onSelectItem: (item: T) => void
  onSelectGroup?: (group: string, items: T[]) => void
  isMobile: boolean
}

const NavigationSplitViewListView = <T extends Identifiable>({
  data,
  groupingFunction,
  listItemComponent,
  groupHeadingComponent,
  groupPanelHeadingComponent,
  groupDetailComponent,
  detailComponent,
  onSelectItem,
  onSelectGroup,
  itemRoute,
  groupRoute,
  groupingKey,
  isMobile,
  selectedItemId,
  selectedGroupId,
}: ListViewProps<T>) => {
  const router = useRouter()
  const { pushView } = useNavigationProvider()

  const handleSelectGroup = useCallback(
    (group: string, items: T[]) => {
      if (isMobile) {
        pushView(groupDetailComponent?.(group, items), {
          route: groupRoute?.(group),
          query: router.query,
        })
      } else {
        onSelectGroup?.(group, items)
      }
    },
    [
      groupDetailComponent,
      groupRoute,
      isMobile,
      onSelectGroup,
      pushView,
      router.query,
    ]
  )

  const handleSelectItem = useCallback(
    (item: T, group: string) => {
      if (isMobile) {
        pushView(detailComponent(item, group), {
          route: itemRoute(item),
          query: router.query,
        })
      } else {
        onSelectItem(item)
      }
    },
    [detailComponent, isMobile, itemRoute, onSelectItem, pushView, router.query]
  )

  // Group the data if a grouping function is provided
  let groupedData: { [key: string]: T[] } | undefined = undefined
  if (groupingFunction) {
    groupedData = groupingFunction(data)
  }

  return (
    <>
      {groupedData ? (
        <>
          {Object.keys(groupedData).map((key) => (
            <Box key={key} _notLast={{ pb: 4 }}>
              {/* Group heading, typically a label label */}
              <Box w='full'>
                {groupHeadingComponent ? (
                  groupHeadingComponent(
                    key,
                    Object.values(groupedData?.[key] ?? [])
                  )
                ) : (
                  <ListViewHeading>{key}</ListViewHeading>
                )}
              </Box>

              {/* Panel heading, sits below the group heading, optional */}
              {groupPanelHeadingComponent && (
                <Box
                  onClick={() =>
                    handleSelectGroup(
                      key,
                      Object.values(groupedData?.[key] ?? [])
                    )
                  }
                  w='full'
                >
                  {groupPanelHeadingComponent(
                    key,
                    Object.values(groupedData?.[key] ?? []),
                    selectedGroupId === key
                  )}
                </Box>
              )}

              {/* List for particular group segment */}
              <Panel
                p={0}
                _notLast={{ mb: 4 }}
                borderColor={
                  selectedGroupId === key ? 'borderSelected' : 'borderList'
                }
                _hover={{
                  borderColor:
                    selectedGroupId === key && !isMobile
                      ? 'borderSelected'
                      : 'inherit',
                }}
                role='group'
                overflow='hidden'
              >
                <ListView>
                  {groupedData?.[key].map((item) => (
                    <ListViewItem
                      key={item.id}
                      onClick={() => handleSelectItem(item, groupingKey(item))}
                      isSelected={item.id === selectedItemId}
                    >
                      {listItemComponent(
                        item,
                        item.id === selectedItemId,
                        groupingKey(item)
                      )}
                    </ListViewItem>
                  ))}
                </ListView>
              </Panel>
            </Box>
          ))}
        </>
      ) : (
        // No grouping, just a list
        <ListView>
          {data.map((item) => (
            <ListViewItem
              key={item.id}
              onClick={() => handleSelectItem(item, groupingKey(item))}
            >
              {listItemComponent(
                item,
                item.id === selectedItemId,
                groupingKey(item)
              )}
            </ListViewItem>
          ))}
        </ListView>
      )}
    </>
  )
}

export default NavigationSplitViewListView
