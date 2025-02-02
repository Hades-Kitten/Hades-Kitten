import Verify from "./models/verify";
import sequealize from "./utils/database";

sequealize.sync({ force: true })
Verify.sync({force: true})
