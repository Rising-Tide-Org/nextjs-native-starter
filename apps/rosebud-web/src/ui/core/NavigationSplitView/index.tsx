import { Box, useColorMode } from '@chakra-ui/react'
import useIsMobile from 'hooks/useIsMobile'
import { useRouter } from 'next/router'
import { useNavigationProvider } from 'providers/NavigationProvider'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import scrollBarCss from 'styles/theme/components/scrollbar'
import { Identifiable } from 'types/Generic'
import { kViewPadding } from 'ui/constants'
import Panel from '../Panel'
import { NavigationSplitViewProps } from './common'
import NavigationSplitViewListView from './NavigationSplitViewListView'

const NavigationSplitView = <T extends Identifiable>({
  data,
  groupingKey,
  groupingFunction,
  listItemComponent,
  groupHeadingComponent,
  groupPanelHeadingComponent,
  detailComponent,
  emptyListComponent,
  emptyDetailComponent,
  searchComponent,
  itemRoute,
  groupDetailComponent,
  groupRoute,
  selectedItemId,
  selectedGroupId,
}: NavigationSplitViewProps<T>) => {
  const router = useRouter()
  const { pushView } = useNavigationProvider()
  const initializedRef = useRef(false)
  const { colorMode } = useColorMode()

  const [selectedItem, setSelectedItem] = useState<T | null>(
    data.filter((item) => item.id === selectedItemId)?.[0]
  )
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    selectedGroupId ?? null
  )
  const [selectedGroupItems, setSelectedGroupItems] = useState<T[] | null>(
    data.filter((item) => groupingKey?.(item) === selectedGroupId)
  )

  const isMobile = useIsMobile()

  /**
   * When the selected item or group changes (usually via url change), update the selected state
   */
  useEffect(() => {
    if (selectedGroupId) {
      const items = data.filter(
        (item) => groupingKey?.(item) === selectedGroupId
      )

      if (items.length === 0) {
        setSelectedGroup(null)
        return
      }

      if (selectedGroupId !== selectedGroup) {
        setSelectedGroup(selectedGroupId)
        setSelectedGroupItems(items)
        setSelectedItem(null)
      }
      return
    }

    setSelectedGroup(null)
    setSelectedGroupItems(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, data])

  useEffect(() => {
    if (selectedGroupId) {
      return
    }

    if (selectedItemId) {
      if (selectedItemId !== selectedItem?.id) {
        const item = data.filter((item) => item.id === selectedItemId)?.[0]
        if (item) {
          setSelectedGroup(null)
          setSelectedItem(item)
        }
      }

      const item = data.filter((item) => item.id === selectedItemId)
      if (item.length) return
    }

    // This ensures if the selected item is not in the data, we select the first item
    // e.g. if the user deletes the selected item
    setSelectedItem(data?.[0])

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId, selectedGroupId, data])

  /**
   * If we're on mobile and we have a selected item on mount, push the detail view
   * This is necessary for deep linking
   */
  useEffect(() => {
    if (isMobile && selectedItemId) {
      const item =
        selectedItem || data.filter((item) => item.id === selectedItemId)?.[0]

      if (item && initializedRef.current === false) {
        initializedRef.current = true
        pushView(detailComponent(item, groupingKey?.(item)), {
          route: itemRoute(item),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * If we're on mobile and we have a selected group on mount, push the detail view
   * This is necessary for deep linking
   */
  useEffect(() => {
    if (
      isMobile &&
      selectedGroupId &&
      groupingKey &&
      groupDetailComponent &&
      groupRoute
    ) {
      const items =
        data.filter((item) => groupingKey(item) === selectedGroupId) ?? []

      if (items && initializedRef.current === false) {
        initializedRef.current = true
        pushView(groupDetailComponent(selectedGroupId, items), {
          route: groupRoute(selectedGroupId),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * When an item is selected, push the detail view
   */
  const onSelectItem = useCallback(
    (item: T) => {
      if (itemRoute?.(item)) {
        const urlParams = new URLSearchParams(window.location.search)
        const qParam = urlParams.get('q')
        router.push(
          {
            pathname: itemRoute(item),
            ...(searchComponent && qParam
              ? {
                  query: {
                    q: qParam,
                  },
                }
              : {}),
          },
          undefined,
          { shallow: true }
        )
      }
      setSelectedItem(item)
      setSelectedGroup(null)
    },
    [itemRoute, router, searchComponent]
  )

  const onSelectGroup = useCallback(
    (group: string, items: T[]) => {
      if (!groupDetailComponent) {
        return
      }
      if (groupRoute?.(group)) {
        router.push(groupRoute(group), undefined, { shallow: true })
      }
      setSelectedItem(null)
      setSelectedGroupItems(items)
      setSelectedGroup(group)
    },
    [groupDetailComponent, groupRoute, router]
  )

  return (
    <Box p={kViewPadding} h={{ base: 'auto', md: 'full' }}>
      <Panel
        w='full'
        h={{ base: 'auto', md: 'full' }}
        p={0}
        variant='hstack'
        bg='transparent'
        border={0}
      >
        <Box
          w={{ base: 'full', md: '360px' }}
          overflowY={{ base: 'initial', md: 'auto' }}
          css={scrollBarCss(colorMode)}
          pr={{ base: 0, md: 1 }}
          mr={{ base: 0, md: 2 }}
          h='auto'
        >
          {searchComponent}
          {data.length === 0 ? (
            emptyListComponent
          ) : (
            <NavigationSplitViewListView
              data={data}
              groupingKey={groupingKey}
              groupingFunction={groupingFunction}
              listItemComponent={listItemComponent}
              detailComponent={detailComponent}
              onSelectItem={onSelectItem}
              onSelectGroup={onSelectGroup}
              itemRoute={itemRoute}
              groupRoute={groupRoute}
              isMobile={isMobile}
              selectedItemId={selectedItem?.id}
              selectedGroupId={selectedGroup}
              groupDetailComponent={groupDetailComponent}
              groupHeadingComponent={groupHeadingComponent}
              groupPanelHeadingComponent={groupPanelHeadingComponent}
            />
          )}
        </Box>
        {/* We don't need to render this on mobile, as it gets pushed on as a separate view */}
        {!isMobile && (
          <Panel
            flex={1}
            overflowY='auto'
            css={scrollBarCss(colorMode)}
            p={kViewPadding}
          >
            {selectedGroup &&
              !selectedItem &&
              groupDetailComponent &&
              groupDetailComponent(selectedGroup, selectedGroupItems ?? [])}
            {selectedItem &&
              !selectedGroup &&
              detailComponent(selectedItem, groupingKey?.(selectedItem))}
            {!data.length &&
              emptyDetailComponent?.(
                selectedItem ?? undefined,
                selectedItem ? groupingKey?.(selectedItem) : undefined
              )}
          </Panel>
        )}
      </Panel>
    </Box>
  )
}

export default NavigationSplitView
