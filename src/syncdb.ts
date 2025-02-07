import VerifyRole from "./models/verifyRole";
import Verify from "./models/verify";
import Region from "./models/region";
import Profile from "./models/profile";
import Tweet from "./models/tweet";

import runMigrations from "./db/migrations";
import sequealize from "./utils/database";
import { Logger } from "./utils/logging";

const logger = new Logger("syncdb");

async function syncDatabase() {
  await sequealize.sync();
  await Verify.sync();
  await VerifyRole.sync();
  await Region.sync();
  await Profile.sync();
  await Tweet.sync({ alter: true });

  await runMigrations(logger);
}

syncDatabase()
  .then(() => {
    logger.info("Database synced!");
  })
  .catch((err) => {
    logger.error("Error syncing database:", err);
  });
