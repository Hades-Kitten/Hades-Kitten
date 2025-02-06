import VerifyRole from "./models/verifyRole";
import Verify from "./models/verify";
import Region from "./models/region";
import Profile from "./models/profile";
import Tweet from "./models/tweet";

import sequealize from "./utils/database";

async function syncDatabase() {
  await sequealize.sync({ force: true });
  await Verify.sync({ force: true });
  await VerifyRole.sync({ force: true });
  await Region.sync({ force: true });
  await Profile.sync({ force: true });
  await Tweet.sync({ force: true });
}

syncDatabase()
  .then(() => {
    console.log("Database synced!");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
