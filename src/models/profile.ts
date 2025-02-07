import sequelize from "../utils/database";
import Sequelize from "sequelize";

const Profile = sequelize.define(
  "profile",
  {
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    guildId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    handle: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: "guild_handle_unique",
      validate: {
        is: /^[a-zA-Z0-9_]+$/i,
        len: [3, 32],
      },
    },
    displayName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    bio: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    profilePicture: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bannerPicture: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    followers: {
      type: Sequelize.JSON,
      defaultValue: [],
    },
    following: {
      type: Sequelize.JSON,
      defaultValue: [],
    },
    notificationsEnabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["guildId", "handle"],
        name: "guild_handle_unique",
      },
    ],
  },
);

export default Profile;
