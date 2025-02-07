import type { Logger } from "../utils/logging";
import migrateProfiles from "./migrate-profiles";

async function runMigrations(logger: Logger) {
  logger.info("Running migrations...");
  try {
    await migrateProfiles(logger);
  } catch (error) {
    logger.error("Error running migrations:", error);
  }
}

export default runMigrations;
