import Profile from "./models/profile";
import Region from "./models/region";
import Tweet from "./models/tweet";
import Verify from "./models/verify";
import VerifyRole from "./models/verifyRole";

import runMigrations from "./db/_migrations";
import sequealize from "./utils/database";
import { Logger } from "./utils/logging";

const logger = new Logger("syncdb");

async function syncDatabase() {
  await sequealize.sync();
  await Verify.sync();
  await VerifyRole.sync();
  await Region.sync();
  await Profile.sync();
  await Tweet.sync();

  await runMigrations(logger);
}

syncDatabase()
  .then(() => {
    logger.info("Database synced!");
  })
  .catch((err) => {
    logger.error("Error syncing database:", err);
  });
