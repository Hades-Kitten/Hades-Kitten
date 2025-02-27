import Sequelize from "sequelize";
import sequelize from "../utils/database";

const Tweet = sequelize.define("tweet", {
  profileId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING(2148),
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  messageId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  likes: {
    type: Sequelize.JSON,
    defaultValue: [],
  },
  replyToTweetId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "tweets",
      key: "id",
    },
  },
});

export default Tweet;
