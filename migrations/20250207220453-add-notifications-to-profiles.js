"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo && !tableInfo.notificationsEnabled) {
      await queryInterface.addColumn("profiles", "notificationsEnabled", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo.notificationsEnabled) {
      await queryInterface.removeColumn("profiles", "notificationsEnabled");
      console.log("Prrr! Removed 'notificationsEnabled' from 'profiles' table");
    }
  },
};
