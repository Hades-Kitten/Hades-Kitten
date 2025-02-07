export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "likes", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("posts", "likes");
  },
};
