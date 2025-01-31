//Imports
const { ActivityType } = require("discord.js");
const logging = require("../../helpers/logging");
require("dotenv/config");
//Ready event
module.exports = {
    name: "ready",
    async execute(client) {
        //Status | Main function
        const statusArray = [
            {
              type: ActivityType.Playing,
              content: "Nationstates.net",
            },
            {
              type: ActivityType.Watching,
              content: "a circus called the British Parliament",
            },
            {
              type: ActivityType.Custom,
              content: `Did you know that spending your time writing factbooks in Nationstates is useful?`,
            },
            {
              type: ActivityType.Listening,
              content: `Communists and Capitalists debate!`,
            },
            {
              type: ActivityType.Custom,
              content: `Anarchists when doctors say they have something called a pro state`,
            },
          ];
      
          //Status | Main function
          async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);
            client.user.setStatus("idle");
            try {
              await client.user.setPresence({
                activities: [
                  {
                    name: statusArray[option].content,
                    type: statusArray[option].type,
                  },
                ],
              });
            } catch (error) {
              return;
            }
          }
          setInterval(pickPresence, 10 * 1000);
      
          //Bot startup
          logging(`${client.user.username} is online!`, "INFO");
    },
};
