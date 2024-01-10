import { Identifiable } from 'types/Generic'

export type NavigationSplitViewProps<T extends Identifiable> = {
  data: T[]
  groupingKey: (item: T) => string
  groupingFunction?: (items: T[]) => { [key: string]: T[] }

  listItemComponent: (
    item: T,
    isSelected: boolean,
    group: string
  ) => React.ReactNode
  groupHeadingComponent?: (group: string, item: T[]) => React.ReactNode
  groupPanelHeadingComponent?: (
    group: string,
    item: T[],
    isSelected: boolean
  ) => React.ReactNode

  itemRoute: (item: T) => string
  groupRoute?: (group: string) => string

  emptyListComponent?: React.ReactNode
  emptyDetailComponent?: (item?: T, group?: string) => React.ReactNode
  searchComponent?: React.ReactNode

  detailComponent: (item: T, group?: string) => React.ReactNode
  groupDetailComponent?: (group: string, items: T[]) => React.ReactNode

  selectedItem?: T | null
  selectedItemId?: string | null
  selectedGroupId?: string | null
}
