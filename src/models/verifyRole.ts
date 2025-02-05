import sequelize from "../utils/database"; 
import Sequelize from "sequelize";

const verify_role = sequelize.define('verify_role', { 
    guildId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    roleId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
})

export default verify_role