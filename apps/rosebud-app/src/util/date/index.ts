import { Timestamp } from 'firebase/firestore'
import moment from 'moment'

export const Hours = Array.from(Array(24)).map((_, i) => i)
export const HourLocalFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: 'short',
})

/**
 * Formats an hour as a local time string (e.g. 9pm or 21:00)
 */

export function hourAsLocalTimeString(hour: number): string {
  return HourLocalFormatter.format(new Date(0, 0, 0, hour, 0, 0, 0))
}

/**
 * @returns true if today is Sunday or if it is Monday before 3am
 */
export const isTodaySunday = (): boolean => {
  const today = moment()
  return (
    moment().isoWeekday() === 7 ||
    (today.isoWeekday() === 1 && today.hour() < 3)
  )
}

/**
 * @returns a date that accounts for the fact the user may be entering data for the previous day
 */

export const getFuzzyDate = (utc = false): string => {
  const today = utc ? moment.utc() : moment()
  if (today.hours() < 3) {
    return today.subtract(1, 'days').format('YYYY-MM-DD')
  } else {
    return today.format('YYYY-MM-DD')
  }
}

export const getFuzzyTomorrow = (utc = false): string => {
  const today = utc ? moment.utc() : moment()
  if (today.hours() < 3) {
    return today.format('YYYY-MM-DD')
  }
  return today.add(1, 'days').format('YYYY-MM-DD')
}

/**
 * @returns true if the date is today or yesterday (accounting for the fact the user may be entering data for the previous day)
 * @param dateString
 * @returns
 */
export const isFuzzyToday = (dateString: string): boolean => {
  return (
    moment().subtract('3', 'hours').isSame(moment(dateString), 'day') ||
    moment(dateString).isSame(moment(), 'day')
  )
}

/**
 * For use with the weekly reflection.
 * Returns the week number for the previous week, except on Sundays, when it returns the current week number.
 */
export const getFuzzyWeek = (): string => {
  const today = moment()
  const dayOfWeek = today.day() // 0 is Sunday, 1 is Monday, etc.

  if (dayOfWeek === 0) {
    // If today is Sunday
    return today.format('YYYY-WW')
  } else {
    // If today is Monday to Saturday
    return today.subtract(1, 'week').format('YYYY-WW')
  }
}

export const isYesterday = (dateString: string): boolean => {
  return moment().subtract(1, 'days').isSame(moment(dateString), 'day')
}

export const isTomorrow = (dateString: string): boolean => {
  return moment().add(1, 'days').isSame(moment(dateString), 'day')
}

/**
 * @returns true if the current time is between 5am and 11:59am
 */
export const isMorning = (): boolean => {
  const now = new Date()
  return now.getHours() < 12 && now.getHours() > 4
}

/**
 * Get the nearest UTC hour from a local hour, taking into account DST.
 * Nearest because some UTC offsets are not always 60 minutes.
 * @param localHour
 * @returns
 */
export function getNearestUTCHourFromLocal(localHour: number): number {
  let now = moment()
  now = now.set('hour', localHour)

  if (!now?.isValid()) {
    throw new Error(`Invalid Hour ${localHour}`)
  }

  const utcHour = now.utc().hour()
  return utcHour
}

const DefaultTimezone = 'America/New_York'

/**
 * Get North American Timezone
 */
export function getTimezone() {
  const modifier = moment().isDST() ? 1 : 0
  const utcOffset = moment().utcOffset() - modifier * 60
  const timezone = (() => {
    switch (utcOffset) {
      case -480:
        return 'America/Los_Angeles'
      case -420:
        return 'America/Denver'
      case -360:
        return 'America/Chicago'
      case -300:
        return 'America/New_York'
      default:
        return DefaultTimezone
    }
  })()
  return timezone
}

/**
 * Get the week start / end range for a given date
 */
export const getWeekDateRange = (date: Date = new Date()): [Date, Date] => {
  const currentDay = date.getDay()
  const offset = currentDay === 0 ? 6 : currentDay - 1

  const startOfWeek = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - offset
  )

  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 6,
    23,
    59,
    59
  )

  return [startOfWeek, endOfWeek]
}

export const getCurrentWeekNumber = (): number => {
  const now = new Date()
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
  const pastDaysOfYear = (now.valueOf() - firstDayOfYear.valueOf()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export const getDateRangeByWeekNumber = (
  weekNumber: number,
  year: number = new Date().getFullYear()
): [Date, Date] => {
  const firstDayOfYear = new Date(year, 0, 1)
  const offset = firstDayOfYear.getDay()
  const daysOffset = (weekNumber - 1) * 7 - offset

  const startOfWeek = new Date(year, 0, 1 + daysOffset)

  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 6,
    23,
    59,
    59
  )

  return [startOfWeek, endOfWeek]
}

/**
 * Returns the Sunday of the week for a given date.
 * @param date Input date.
 * @returns Date for the Sunday of the week.
 */
export const getEndOfWeek = (date: Date) => {
  const day = date.getUTCDay()
  const currentDate = date.getUTCDate()

  // Calculate the difference to get to the end of the week (Sunday)
  const difference = currentDate - day + 7

  // Create a new date object to avoid modifying the original
  const newDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), currentDate)
  )
  newDate.setUTCDate(difference)

  return newDate
}

/**
 * Finds the following Monday for a given date.
 * @param date Input date.
 * @returns Date for the following Monday.
 */
export const getFollowingMonday = (date: Date) => {
  const newDate = new Date(date.getTime())
  const dayOfWeek = newDate.getUTCDay() // 0 is Sunday, 1 is Monday, etc.
  let daysToAdd

  if (dayOfWeek === 0) {
    // If it's Sunday
    daysToAdd = 1
  } else {
    // For any other day
    daysToAdd = 8 - dayOfWeek
  }

  newDate.setDate(newDate.getDate() + daysToAdd)
  return newDate
}

/**
 * Get the number of days since a given Firestore timestamp
 * @param timestamp A Firestore `Timestamp`
 * @returns The number of days since the timestamp
 */
export const daysSinceTimestamp = (timestamp: Timestamp): number =>
  Math.floor((Date.now() / 1000 - timestamp.seconds) / (24 * 60 * 60))

/**
 * Get a human formatted string from a date string, e.g 07/01/2021 -> July 1, 2021
 */
export const formatToHumanReadableDate = (date?: string) => {
  const now = moment()
  const inputDate = moment(date)

  if (inputDate.isSame(now, 'day')) {
    return 'Today'

    // We treat fuzzy today as yesterday because we want to show the user
    // that whatever this method is used that flow is for the previous day
  } else if (
    isFuzzyToday(inputDate.toString()) ||
    isYesterday(inputDate.toString())
  ) {
    return 'Yesterday'
  } else if (isTomorrow(inputDate.toString())) {
    return 'Tomorrow'
  }

  return inputDate.format('MMMM D, YYYY')
}

/**
 * Formats a given duration in milliseconds into a string representation
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted string representation ("x years, y months, z days")
 */
export const formatDuration = (ms: number): string => {
  const secondsTotal = Math.floor(ms / 1000)
  let days = Math.floor(secondsTotal / (3600 * 24))
  const remainder = secondsTotal % (3600 * 24)

  // If there's any remainder (hours, minutes, or seconds), round up to the next day.
  if (remainder > 0) {
    days += 1
  }

  let years = 0
  let months = 0

  while (days >= 365) {
    years += 1
    days -= 365
  }

  while (days >= 30) {
    months += 1
    days -= 30
  }

  const yearStr = years ? `${years} year${years !== 1 ? 's' : ''}` : ''
  const monthStr = months ? `${months} month${months !== 1 ? 's' : ''}` : ''
  const dayStr = days ? `${days} day${days !== 1 ? 's' : ''}` : ''

  return [yearStr, monthStr, dayStr].filter(Boolean).join(', ')
}

/**
 * Format the current date in a YYYY-MM-DD format without moment.js — for use on edge routes
 * @returns A string representation of the current date in YYYY-MM-DD format
 */
export const formatCurrentDate = (): string => {
  // Create a new Date object
  const currentDate = new Date()

  // Get the year, month, and day components
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Month is 0-indexed, so we add 1
  const day = String(currentDate.getDate()).padStart(2, '0')

  // Format the date in "YYYY-MM-DD" format
  return `${year}-${month}-${day}`
}
