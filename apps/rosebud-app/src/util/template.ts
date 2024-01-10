import moment from 'moment'
import { ComposeTemplateMetadata } from 'types/Compose'
import { Entry } from 'types/Entry'

/**
 * Rank templates based on how recently they were done and
 * how close they are to the appropriate time
 * @param entries Entries to check against
 * @param templates Templates to rank
 * @returns
 */
export const rankTemplates = (
  entries: Entry[],
  templates: ComposeTemplateMetadata[]
): ComposeTemplateMetadata[] => {
  const rankedTemplates = templates.map((journal) => {
    let score = journal.weight || 0
    // If we haven't done the journal today, rank it higher
    const today = moment().format('YYYY-MM-DD')
    const hasDoneToday = entries.some(
      (entry) => entry.templateId === journal.templateId && entry.day === today
    )
    if (!hasDoneToday) {
      score += 100
    }
    // If the journal has a time of day, rank it higher if it's the right time
    if (journal.timeofDayRange) {
      const startHour = journal.timeofDayRange[0]
      const endHour = journal.timeofDayRange[1]
      const hour = moment().hour()
      if (
        // current hour is between start and end hour of the journal
        (hour >= startHour && hour <= endHour) ||
        // current hour is between start and end hour of the journal, but the journal spans midnight
        (endHour < startHour && (hour >= startHour || hour <= endHour))
      ) {
        score += 50
      }

      // Penalize journals that are far from the current time
      const distance = Math.min(
        Math.abs(hour - startHour),
        Math.abs(hour - endHour)
      )
      score -= distance * 10
    }

    return {
      templateId: journal.templateId,
      score,
    }
  })

  // Sort and return the journals by score
  rankedTemplates.sort((a, b) => b.score - a.score)
  return rankedTemplates.map(
    (journal) => templates.find((j) => j.templateId === journal.templateId)!
  )
}
