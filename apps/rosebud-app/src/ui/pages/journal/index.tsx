import { Flex } from '@chakra-ui/react'
import { orderBy, query, where } from 'firebase/firestore'
import useFetchMany from 'hooks/useFetchMany'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { Entry } from 'types/Entry'
import NavigationSplitView from 'ui/core/NavigationSplitView'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import JournalDetailView from './JournalDetailView'
import JournalListViewItem from './JournalListViewItem'
import ListViewHeading from 'ui/core/ListView/ListViewHeading'
import JournalWeekDetailView from './JournalWeekDetailView'
import JournalWeeklyHeadingView from './JournalWeeklyHeadingView'
import { getWeekLabel, groupArrayByKey } from 'util/entries'
import moment from 'moment'
import { Analysis } from 'types/Analysis'
import JournalEmptyListView from './JournalEmptyListView'
import JournalEmptyDetailView from './JournalEmptyDetailView'
import SearchInput from 'ui/core/SearchInput'
import SearchInputStates from 'ui/core/SearchInput/SearchInputStates'
import { flattenObject } from 'util/object'
import getUserLocale from 'get-user-locale'
import Analytics from 'lib/analytics'
import debounce from 'lodash/debounce'
import JournalListViewDraftItem from './JournalListViewDraftItem'
import useIsMobile from 'hooks/useIsMobile'

type Props = {
  query?: string
}

const debouncedSearchQueryAnalytics = debounce((queryLength: number) => {
  Analytics.trackEvent('journal.search.onQuery', {
    queryLength,
  })
}, 1000)

const JournalComponent = ({ query: urlQueryParam }: Props) => {
  const { asPath } = useRouter()
  const isMobile = useIsMobile()

  const [searchQuery, setSearchQuery] = useState(urlQueryParam || '')

  useEffect(() => {
    Analytics.trackEvent('journal.entries.view')
  }, [])

  const { data: drafts } = useFetchMany<Entry>(
    'drafts',
    (q) => query(q, orderBy('date', 'desc')),
    {
      subscribe: true,
    }
  )
  const userLocale = useMemo(() => getUserLocale(), [])

  // Fetch all entries
  // TODO: Implement pagination (non-trivial)
  const { data: entries } = useFetchMany<Entry>(
    'entries',
    (q) => query(q, orderBy('day', 'desc'), orderBy('date', 'desc')),
    {
      subscribe: true,
    }
  )

  // Fetch the item id or week id from the URL
  const [itemId, weekId] = useMemo(() => {
    let itemId: string | undefined
    let weekId: string | undefined

    const parts = asPath.split('/').map((i) => i.split('?')[0])

    if (parts.length > 3) {
      weekId = parts[3]
    } else if (parts.length > 2) {
      itemId = parts.pop()
    }

    if (!itemId && !weekId && !isMobile) {
      // If there is no item id, use the first entry id
      // This is to make sure that the first entry is selected when the user navigates to the journal
      // or they delete the entry they are on
      // TODO: This should probably ultimately be handled by the NavigationSplitView
      itemId = entries?.[0]?.id
    }

    return [itemId, weekId]
  }, [asPath, entries, isMobile])

  const handleSearchQuery = (query: string) => {
    // Do not dispatch analytics on clear
    if (query.length) {
      debouncedSearchQueryAnalytics(query.length)
    }
    setSearchQuery(query)
  }

  // Fetch all weekly summaries
  const { data: summaries } = useFetchMany<Analysis>(
    'analysis',
    (q) => query(q, where('type', '==', 'weekly')),
    {
      subscribe: true,
    }
  )

  // Memoed entries and drafts, this is to combine entries and drafts into a single array, since they are of the same type
  const entriesAndDrafts = useMemo(() => {
    if (!entries && !drafts) {
      return []
    }

    return [...(entries ?? []), ...(drafts ?? [])]
  }, [drafts, entries])

  // Memoed entries as summarized strings for search, this is to pre-compose entries for the local search functionality
  // we take the fields on the entry that we want to search on and join them into a single string
  const indexedEntries = useMemo(() => {
    if (!entries && !drafts) {
      return {}
    }

    return entriesAndDrafts.reduce((acc, etr) => {
      const entryId = etr.id as string
      const flattenEntry = flattenObject(etr)

      const entryIndexArr = [] as string[]

      for (const key in flattenEntry) {
        if (
          [
            // Anything summary related (no ids in there)
            'summary',
            // Everything related to people, topics, and emotions (no ids in there)
            'entities',
            // Every commitment user took for that entry (no ids in there)
            'commitments',
          ].some((indexedKey) => key.startsWith(indexedKey)) ||
          // Only responses to the questions, no other metadata
          (key.startsWith('questions.') && key.includes('.response.'))
        ) {
          entryIndexArr.push(flattenEntry[key] as string)
        }
      }

      acc[entryId] = entryIndexArr.join(' ').toLocaleLowerCase(userLocale)
      return acc
    }, {} as Record<string, string>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesAndDrafts])

  /**
   * Filter entries by search query if there is one, otherwise return all entries
   */

  const filteredEntries = useMemo(() => {
    if (!searchQuery) {
      return entriesAndDrafts
    }

    const lowerCasedQuery = searchQuery.toLocaleLowerCase(userLocale)

    return entriesAndDrafts.filter((e) =>
      indexedEntries[e.id as string].includes(lowerCasedQuery)
    )
  }, [entriesAndDrafts, indexedEntries, searchQuery, userLocale])

  if (!entries || !summaries) {
    return null
  }

  return (
    <>
      <NavigationBar title='Journal' />

      <NavigationSplitView<Entry>
        data={filteredEntries}
        groupingKey={(item) => {
          if (item.isDraft) {
            return 'drafts'
          }
          return moment(item.day).format('YYYY-WW')
        }}
        groupingFunction={(items) =>
          groupArrayByKey(items, 'day', {
            key: 'isDraft',
            value: true,
            groupKey: 'drafts',
          })
        }
        selectedItemId={itemId}
        selectedGroupId={weekId}
        groupRoute={(group) => `/journal/week/${group}`}
        itemRoute={(item) => `/journal/${item.id}`}
        listItemComponent={(item, _isSelected, group) =>
          group === 'drafts' ? (
            <JournalListViewDraftItem entry={item} />
          ) : (
            <JournalListViewItem entry={item} />
          )
        }
        searchComponent={
          <>
            <SearchInput
              position='sticky'
              top={0}
              initialQuery={searchQuery}
              pb={3}
              bg='inherit'
              // Prevents input from changing width when empty list is shown
              maxW={{ base: 'full', md: '350px' }}
              onQuery={handleSearchQuery}
            />
            <SearchInputStates
              isEmpty={Boolean(searchQuery && !filteredEntries.length)}
              emptyLabel='No entries found'
            />
          </>
        }
        detailComponent={
          searchQuery && !filteredEntries.length
            ? () => null
            : (item, group) => (
                <JournalDetailView entry={item} groupKey={group} />
              )
        }
        emptyListComponent={searchQuery ? null : <JournalEmptyListView />}
        emptyDetailComponent={
          searchQuery
            ? (item, group) =>
                item ? (
                  <JournalDetailView entry={item} groupKey={group} />
                ) : (
                  <JournalEmptyDetailView entries={entries ?? []} />
                )
            : () => <JournalEmptyDetailView entries={entries ?? []} />
        }
        groupDetailComponent={(group, items) => (
          <JournalWeekDetailView
            entries={items}
            groupKey={group}
            analysis={summaries.find((s) => s.id === `weekly-${group}`)}
          />
        )}
        groupHeadingComponent={(group) => (
          <Flex w='full' roundedTop='md' role='group' pb={0} direction='column'>
            <ListViewHeading>
              {group === 'drafts'
                ? 'Drafts'
                : getWeekLabel(moment(group, 'GGGG-WW').toDate())}
            </ListViewHeading>
          </Flex>
        )}
        groupPanelHeadingComponent={
          searchQuery
            ? () => null
            : (group, items, isSelected) =>
                group === 'drafts' ? null : (
                  <JournalWeeklyHeadingView
                    week={group}
                    analysis={summaries.find((s) => s.id === `weekly-${group}`)}
                    entryCount={items.length}
                    isSelected={isSelected}
                  />
                )
        }
      />
    </>
  )
}

export default JournalComponent
