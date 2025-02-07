import Sequelize from "sequelize";
import db from "../utils/database";

const Region = db.define("region", {
  guildId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  regionName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  rmbChannelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  activityChannelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  dispatchChannelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  tweetChannelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  dateChannelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

export default Region;
