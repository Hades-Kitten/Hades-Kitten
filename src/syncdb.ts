import VerifyRole from "./models/verifyRole";
import Verify from "./models/verify";
import Region from "./models/region";
import Profile from "./models/profile";
import Tweet from "./models/tweet";

import sequealize from "./utils/database";

async function syncDatabase() {
  await sequealize.sync();
  await Verify.sync();
  await VerifyRole.sync();
  await Region.sync();
  await Profile.sync();
  await Tweet.sync();
}

syncDatabase()
  .then(() => {
    console.log("Database synced!");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
