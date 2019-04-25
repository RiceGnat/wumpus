const commands = {};

function ParseCommand(str, context) {
    // Separate command word and args
    var args = str.split(" ");
    var cmd = args[0];
    args = args.slice(1);

    return Promise.resolve(commands[cmd] ? commands[cmd].handler(context, ...args) : null);
}

function cmd(name, format, desc, category, handler, sub) {
    if (typeof handler !== "function")
        throw "Handler must be a function";

    const command = {
        name: name,
        format: format,
        description: desc,
        handler: handler,
        subcommands: []
    };

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
    var format = [];
    if (parent) format.push(parent);
    format.push(command.name);
    if (command.format) format.push(command.format);
    return `\`!${format.join(" ")}\`\t${command.description}`;
}

module.exports = {
    parse: ParseCommand,
    add: cmd,
    addsub: subcmd,
    getHelpFormat: cmdHelp
};