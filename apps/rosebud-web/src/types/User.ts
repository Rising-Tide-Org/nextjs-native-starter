import { PriceDiscoveryVariant, PriceIntervalVariant } from 'constants/premium'
import { Timestamp } from 'firebase/firestore'
import { EntryChunkingMode } from './EntryVector'
import { NotificationDeviceType } from './Notification'
import { Subscription } from './Subscription'

export type User = {
  id?: string
  uuid?: string
  phone?: string
  email?: string
  profile?: {
    bio: string
  }
  phoneVerified?: boolean
  emailVerified?: boolean
  timezone?: string
  flags?: {
    [key: string]: boolean | undefined
  }
  onboarding?: {
    [T in string]: string[] | string
  }
  subscription?: Partial<Subscription>
  onesignal_id?: string
  reminder_hour_utc?: number
  reminder_hour_local?: number
  notifications?: {
    enabled: boolean
    channel: NotificationDeviceType
    player_ids?: string[]
  }
  variants?: {
    [key: string]: string | boolean | undefined
    pricing?: PriceDiscoveryVariant
    pricingInterval?: PriceIntervalVariant
  }
  settings: UserSettings
  sessionId?: string
  metadata?: {
    backfilledVectors?: boolean
    lastSeenReleaseNotes?: string
    utm_campaign?: string
    utm_medium?: string
    utm_source?: string
    utm_term?: string
    utm_content?: string
    [key: string]: string | number | boolean | undefined
  }
  migrationNumber?: number
  referredByCode?: string
  createdAt?: Timestamp
}

export enum UserFlag {
  onboardingComplete = 'onboardingComplete',
  notificationPromoDismissed = 'notificationPromoDismissed',
  upgradePromoDismissed = 'upgradePromoDismissed',
  signUpCTADismissed = 'signUpCTADismissed',
  digDeeperTipSeen = 'digDeeperTipSeen',
  newManifestTipSeen = 'newManifestTipSeen',
  finishEntryTipSeen = 'finishEntryTipSeen',
  entitiesTipSeen = 'entitiesTipSeen',
  bookmarkTipSeen = 'bookmarkTipSeen',
  changeQuestionTipSeen = 'changeQuestionTipSeen',
  suggestionsTipSeen = 'suggestionsTipSeen',
  journalModeTipSeen = 'journalModeTipSeen',
  newJournalModalDismissed = 'newJournalModalDismissed',
  // typo here but too late to fix (or update to "7Day") since it's
  // already been set on users in prod.
  satisfactionSurvey7DayDismissed = 'statisfactionSurveyDismissed',
  satisfactionSurvey30DayDismissed = 'satisfactionSurvey30DayDismissed',
  appInstallPromptDismissed = 'appInstallPromptDismissed',
  referralModalDismissed = 'referralModalDismissed',
  pushNotificationsDismissed = 'pushNotificationsDismissed',
  weeklySummaryTipSeen = 'weeklySummaryTipSeen',
  askRosebudTipSeen = 'askRosebudTipSeen',
}

export type UserSettings = {
  journalMode: JournalMode
  memoryEnabled?: boolean
  advancedModelEnabled?: boolean
  entryChunkingMode?: EntryChunkingMode
  locale?: string
  personalizationId?: string
}

export type JournalMode = 'focused' | 'interactive'

export type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}
