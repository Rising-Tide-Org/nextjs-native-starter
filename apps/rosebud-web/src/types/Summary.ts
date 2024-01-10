import { Identifiable } from './Generic'

export type Summary = Identifiable & {
  date: number
  summary: string
  startDate: string
  endDate: string
}
