export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("profiles", "displayName", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Sequelize.col("handle"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("profiles", "displayName");
  },
};
