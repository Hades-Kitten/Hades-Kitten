import sequelize from "../utils/database"; 
import Sequelize from "sequelize";

const Verify = sequelize.define('verify', { 
    userId: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    nation: {
        type: Sequelize.STRING,
        allowNull: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

export default Verify