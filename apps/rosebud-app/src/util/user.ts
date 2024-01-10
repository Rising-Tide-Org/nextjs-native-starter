import { kDefaultReminderTime } from 'constants/defaults'
import { getNearestLanguage } from 'l10n/languages'
import { User } from 'types/User'
import { uuidv4 } from 'util/uuid'
import { getNearestUTCHourFromLocal, getTimezone } from './date'
import getUserLocale from 'get-user-locale'

enum UserNeeds {
  trial_period,
  uuid,
  timezone,
  reminderHour,
  reminderUtcHour,
  settings,
  locale,
}

/**
 * Very early version of a user migration.
 * Returns null if the user was not modified. This way we know if we should
 * update the store or not.
 * @param user
 * @returns
 */
export function migrateUserIfNeeded(user: User | null): User | null {
  if (!user) {
    return null
  }

  const needs = determineUserNeeds(user)

  if (!needs.length) {
    return null
  }

  for (const need of needs) {
    switch (need) {
      case UserNeeds.timezone:
        user = { ...user, timezone: getTimezone() }
        break
      case UserNeeds.uuid:
        user = { ...user, uuid: uuidv4() }
        break
      case UserNeeds.reminderHour:
        user = {
          ...user,
          reminder_hour_local: kDefaultReminderTime,
        }
        break
      case UserNeeds.reminderUtcHour:
        user = {
          ...user,
          reminder_hour_utc: getNearestUTCHourFromLocal(
            user.reminder_hour_local ?? kDefaultReminderTime
          ),
        }
        break
      case UserNeeds.settings:
        user = {
          ...user,
          settings: {
            ...user.settings,
            journalMode: 'focused',
            locale: getNearestLanguage(getUserLocale()).code,
          },
        }
        break
      case UserNeeds.locale:
        user = {
          ...user,
          settings: {
            ...user.settings,
            locale: getNearestLanguage(getUserLocale()).code,
          },
        }
        break
    }
  }

  return user
}

function determineUserNeeds(user: User): Array<UserNeeds> {
  const needs: Array<UserNeeds> = []

  if (!user.timezone) {
    needs.push(UserNeeds.timezone)
  }

  if (!user.uuid) {
    needs.push(UserNeeds.uuid)
  }

  if (!user.reminder_hour_local === undefined) {
    needs.push(UserNeeds.reminderHour)
  }

  if (!user.settings) {
    needs.push(UserNeeds.settings)
  }

  if (!user.settings?.locale) {
    needs.push(UserNeeds.locale)
  }

  if (user.reminder_hour_utc === undefined) {
    needs.push(UserNeeds.reminderUtcHour)
  }

  return needs
}

export const isStaffUser = (uuid = '') => {
  const staff = [
    'a2529311-a630-42d3-a83d-87113c08f169', // Chrys
    '4307095b-8512-494a-a3f1-3b3b6d018d34', // Alice
    '09029c42-01c4-4eb0-a77f-e41312e740d3', // Prairie
    'fc5d6ad0-1e38-40bd-9586-af3c8bbe9140', // Monte
    'f9ad0f33-bb59-4f45-a664-553eacba4a0c', // Sean
    '0c2656b0-6d5b-4085-863b-d50e33e65537', // Andre
  ]

  return staff.includes(uuid)
}

export const userHasVariant = (user: User, variant: string): boolean =>
  isStaffUser(user?.uuid) || user?.variants?.[variant] === true
