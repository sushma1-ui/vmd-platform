import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Add enquiry-context columns to the consultations table:
 *   - journey_stage  ("Where are you in your journey?")
 *   - matter         ("Matter to be discussed")
 *
 * Both map to Payload `text` fields on the Consultations collection (column names are
 * toSnakeCase(fieldName)). `ADD COLUMN IF NOT EXISTS` keeps this idempotent so a
 * re-run — or a table that already has them from a dev push — is safe. Applied in
 * production by `payload migrate` (scripts/run-migrations.mjs) before the CMS build;
 * a failure here aborts the build, so a mismatched schema can never reach the live DB.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "journey_stage" varchar;`,
  );
  await db.execute(sql`ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "matter" varchar;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "consultations" DROP COLUMN IF EXISTS "journey_stage";`);
  await db.execute(sql`ALTER TABLE "consultations" DROP COLUMN IF EXISTS "matter";`);
}
