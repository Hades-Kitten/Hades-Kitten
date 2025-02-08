"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo && !tableInfo.displayName) {
      await queryInterface.addColumn("profiles", "displayName", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: Sequelize.col("handle"),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo.displayName) {
      await queryInterface.removeColumn("profiles", "displayName");
    }
  },
};
