import Sequelize from "sequelize";
import sequelize from "../utils/database";

const Verify = sequelize.define("verify", {
  userId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  guildId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  nation: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  code: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

export default Verify;
