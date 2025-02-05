import Verify from "./models/verify";
import verify_role from "./models/verifyRole";
import sequealize from "./utils/database";

sequealize.sync({ force: true })
Verify.sync({force: true})
verify_role.sync({force: true})