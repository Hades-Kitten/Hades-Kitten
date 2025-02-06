import VerifyRole from "./models/verifyRole";
import Verify from "./models/verify";
import Region from "./models/region";

import sequealize from "./utils/database";

sequealize.sync({ force: true });
Verify.sync({ force: true });
VerifyRole.sync({ force: true });
Region.sync({ force: true });
