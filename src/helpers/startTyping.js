/**
 *
 * @param {string} channel
 */
let startTyping = async function (channel) {
    await channel.sendTyping();
};
module.exports = startTyping;
