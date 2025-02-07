export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("profiles", "displayName", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Unnamed",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("profiles", "displayName");
  },
};
