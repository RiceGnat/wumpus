const commands = {};

function ParseCommand(str, context) {
    // Separate command word and args
    let args = str.split(" ");
    let cmd = args[0];
    args = args.slice(1);

    return Promise.resolve(commands[cmd] ? commands[cmd].handler(context, ...args) : null);
}

function cmd(name, format, desc, category, handler, sub) {
    const command = {
        name: name,
        format: format,
        description: desc,
        handler: null,
        subcommands: []
    };

    // If no handler specified, use subcommand redirect
    if (!handler) {
        command.handler = (context, ...args) => {
            if (args.length > 0 && commands[name].subcommands[args[0]]) {
                return commands[name].subcommands[args[0]].handler(context, args.slice(1));
            }
        }
    }
    // If handler is specified but not a function
    else if (typeof handler !== "function") {
        throw "Handler must be a function";
    }
    // Set command handler to given function
    else {
        command.handler = handler;
    }

    if (sub) {
        commands[category].subcommands[name] = command;
    }
    else {
        command.category = category;
        commands[name] = command;
    }
}

function subcmd(name, format, desc, parent, handler) {
    cmd(name, format, desc, parent, handler, true);
}

function cmdHelp(command, parent) {
    let format = [];
    if (parent) format.push(parent);
    format.push(command.name);
    if (command.format) format.push(command.format);
    return `\`!${format.join(" ")}\`\t${command.description}`;
}

module.exports = {
    parse: ParseCommand,
    add: cmd,
    addsub: subcmd,
    list: commands,
    getHelpFormat: cmdHelp
};