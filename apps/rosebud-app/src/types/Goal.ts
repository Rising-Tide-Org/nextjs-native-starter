export type Goal = {
  id?: string
  name: string
  description?: string
  entryId?: string // The entry that the goal was created by
  completions: string[] // Dates that the goal was completed
  createdAt: string // Date that the goal was created
}
