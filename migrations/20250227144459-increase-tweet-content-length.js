/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("tweets", "content", {
      type: Sequelize.STRING(2148),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("tweets", "content", {
      type: Sequelize.STRING(280),
      allowNull: false,
    });
  },
};
