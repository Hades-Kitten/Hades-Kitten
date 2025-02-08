import type { Logger } from "../utils/logging";
import Profile from "./../models/profile";

export default {
  name: "migrate-profiles",
  exec: async (logger: Logger, suppressLog = false) => {
    const profileLogger = logger.child("profiles");
    if (!suppressLog) profileLogger.info("Migrating profiles...");

    try {
      const profiles = await Profile.findAll();

      for (const profile of profiles) {
        const handle = profile.get("handle") as string;
        const newHandle = handle.replace(/[^a-zA-Z0-9]/g, "");

        await profile.update({
          displayName: handle,
          handle: newHandle,
        });
        if (!suppressLog)
          profileLogger.info(`  Migrated profile: ${handle} -> ${newHandle}`);
      }

      if (!suppressLog) profileLogger.info("  Profile migration complete!");
    } catch (error) {
      if (!suppressLog)
        profileLogger.error("  Error during profile migration:", error);
    }
  },
};
