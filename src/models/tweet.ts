import sequelize from "../utils/database";
import Sequelize from "sequelize";

const Tweet = sequelize.define("tweet", {
  profileId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING(280),
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

export default Tweet;
