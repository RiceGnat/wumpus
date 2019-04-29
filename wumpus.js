const Discord = require("discord.js");
const cmd = require("./wumpus-cmd");

function bootstrap(token, cmdPrefix, appContext, cmdSetupFunc) {
    const bot = new Discord.Client();

    bot.on("ready", function () {
        console.log(`Connected to Discord as ${bot.user.username} (${bot.user.id})`);
        console.log(`${bot.user.username} is in ${Object.entries(bot.guilds).length} servers`);
    });

    // Automatically reconnect on disconnect
    bot.on("disconnect", function (event) {
        console.log(`Disconnected (${event.code}: ${event.reason})`);
        console.log("Reconnecting...");
        bot.login(token);
    });

    // Parse commands
    bot.on("message", function (message) {
        // Build context object
        let context = {
            sender: {
                user: message.author.username,
                userId: message.author.userId,
                channelId: message.channel.id,
                serverId: message.guild ? message.guild.id : null,
            },
            message: message,
            bot: bot
        };

        // Add app context properties
        Object.assign(context, appContext);

        if (message.content.startsWith(cmdPrefix)) {
            cmd.parse(message.content.substring(1), context)
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

    // Connect
    bot.login(token);

    return bot;
}

module.exports = {
    bot: bootstrap
};