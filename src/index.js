"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.clear();
//Imports
require("dotenv/config");
const discord = require("discord.js");
const mongoose = require("mongoose");
const fs_1 = require("fs");
const logging = require("./helpers/logging");
const Token = process.env.Token;
const clientId = process.env.clientId;
const rest = new discord.REST({ version: "9" }).setToken(Token);
//Client
const client = new discord.Client({
    intents: Object.values(discord.GatewayIntentBits).reduce((a, b) => a | b, 0),
});
client.commands = new discord.Collection();
client.commandArray = [];
client.buttons = new discord.Collection();
client.selectMenus = new discord.Collection();
//Commands folder
const commandFolders = (0, fs_1.readdirSync)(`./src/commands`);
for (const folder of commandFolders) {
    const commandFiles = (0, fs_1.readdirSync)(`./src/commands/${folder}`).filter((file) => file.endsWith(`.ts` && `.js`));
    const { commands, commandArray } = client;
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        if (command.data.name) {
            commands.set(command.data.name, command);
        }
        commandArray.push(command.data.toJSON());
    }
}
//Events folder
const eventFolders = (0, fs_1.readdirSync)(`./src/events`);
for (const folder of eventFolders) {
    const eventFiles = (0, fs_1.readdirSync)(`./src/events/${folder}`).filter((file) => file.endsWith(`ts` && `.js`));
    for (const file of eventFiles) {
        const event = require(`./events/${folder}/${file}`);
        if (event.once)
            client.once(event.name, (...args) => event.execute(...args, client));
        else
            client.on(event.name, (...args) => event.execute(...args, client));
    }
}
try {
    logging("Started refreshing application (/) commands.", "INFO");
    rest.put(discord.Routes.applicationCommands(clientId), {
        body: client.commandArray,
    });
    logging("Successfully reloaded application (/) commands.", "INFO");
}
catch (error) {
    logging("Error refreshing application (/) commands", "ERROR");
    logging(error.message, "ERROR");
}
// ===============================================
// Error handling
// ===============================================
//UnhandledRejection
process.on("unhandledRejection", (err) => {
    logging(err.stack, "ERROR");
});
//UncaughtException
process.on("uncaughtException", (err) => {
    logging(err.stack, "ERROR");
});
//Bot start-up
logging(`Initializing Command and Event handlers...`, "INFO");
client.login(Token);
//Process exit
process.on("exit", (code) => {
    logging(`Process exited with code ${code}`, "INFO");
    mongoose.default.connection.close();
});
