const Discord = require("discord.io");
const cmd = require("./wumpus-cmd");

function bootstrap(token, cmdPrefix, appContext, cmdSetupFunc) {
    const bot = new Discord.Client({
        token: token,
        autorun: true
    });

    bot.on("ready", function (evt) {
        console.log(`Connected to Discord as ${bot.username} (${bot.id})`);
        console.log(`${bot.username} is in ${Object.entries(bot.servers).length} servers`);
    });

    // Automatically reconnect on disconnect
    bot.on("disconnect", function (errMsg, code) {
        console.log(`Disconnected (${code}: ${errMsg})`);
        console.log("Reconnecting...");
        bot.connect();
    });

    // Parse commands
    bot.on("message", function (user, userId, channelId, message, evt) {
        // Build context object
        let context = {
            sender: {
                user: user,
                userId: userId,
                channelId: channelId
            },
            bot: bot
        };

        // Add app context properties
        Object.assign(context, appContext);

        if (message.startsWith(cmdPrefix)) {
            cmd.parse(message.substring(1), context)
            .then(msg => {
                if (msg) bot.sendMessage(msg);
            }, error => {
                console.log(error);
            });
        }
    });

    if (typeof cmdSetupFunc === "function") {
        cmdSetupFunc(cmd);
        console.log("Commands registered");
    }

    return bot;
}

module.exports = {
    bot: bootstrap
};