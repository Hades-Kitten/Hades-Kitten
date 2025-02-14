/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const tableInfo = await queryInterface.describeTable("profiles");
		if (tableInfo && !tableInfo.likeNotificationsEnabled) {
			await queryInterface.addColumn("profiles", "likeNotificationsEnabled", {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			});
			await queryInterface.addColumn("profiles", "replyNotificationsEnabled", {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("profiles", "likeNotificationsEnabled");
		await queryInterface.removeColumn("profiles", "replyNotificationsEnabled");
	},
};
