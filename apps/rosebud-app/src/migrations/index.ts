import { CreateTopics } from './1_createTopics'
import { FixDuplicateTopics } from './2_fixDuplicateTopics'
import { MigrateGoals } from './3_migrateGoals'
import { BackfillStats } from './4_backfillStats'
import { UpdateVectors } from './5_updateVectors'

/**
 * Array of migrations in the order that they are to be applied.
 *
 * Warning: Do not change the order of the array unless you know
 * what you are doing.
 */
export const kMigrations = [
  CreateTopics,
  FixDuplicateTopics,
  MigrateGoals,
  BackfillStats,
  UpdateVectors,
]
