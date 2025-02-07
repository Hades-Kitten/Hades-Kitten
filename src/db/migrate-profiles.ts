import type { Logger } from "../utils/logging";
import Profile from "./../models/profile";
import sequelize from "./../utils/database";

async function migrateProfiles(logger: Logger) {
  const profileLogger = logger.child("profiles");
  profileLogger.info("Migrating profiles...");

  try {
    const profiles = await Profile.findAll();

    for (const profile of profiles) {
      const handle = profile.get("handle") as string;
      const newHandle = handle.replace(/[^a-zA-Z0-9]/g, "");

      await profile.update({
        displayName: handle,
        handle: newHandle,
      });
      profileLogger.info(`  Migrated profile: ${handle} -> ${newHandle}`);
    }

    profileLogger.info("  Profile migration complete!");
  } catch (error) {
    profileLogger.error("  Error during profile migration:", error);
  }
}

export default migrateProfiles;
