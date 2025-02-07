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
