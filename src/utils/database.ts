import { Sequelize } from "sequelize";

const sequealize = new Sequelize('database', 'user', 'password', {
    dialect: "sqlite",
    host: "localhost",
    storage: './database.sqlite',
    logging: false
})

export default sequealize