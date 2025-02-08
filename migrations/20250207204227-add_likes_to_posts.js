"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("tweets");
    if (tableInfo && !tableInfo.likes) {
      await queryInterface.addColumn("tweets", "likes", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("tweets");
    if (tableInfo.likes) await queryInterface.removeColumn("tweets", "likes");
  },
};
