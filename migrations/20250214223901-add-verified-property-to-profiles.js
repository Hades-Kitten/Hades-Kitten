/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo && !tableInfo.verified) {
      await queryInterface.addColumn("profiles", "verified", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("profiles");
    if (tableInfo.verified) {
      await queryInterface.removeColumn("profiles", "verified");
    }
  },
};
