export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("profiles", "notificationsEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("profiles", "notificationsEnabled");
  },
};
