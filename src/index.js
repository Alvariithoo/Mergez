'use strict';
// Imports
const Logger = require('./modules/Logger');
const Commands = require('./modules/CommandList');
const Server = require('./Server');

// Init variables
var showConsole = true;

// Start msg
Logger.start();

process.on('exit', function (code) {
    Logger.debug("process.exit(" + code + ")");
    Logger.shutdown();
});

process.on('uncaughtException', function (err) {
    Logger.fatal(err.stack);
    process.exit(1);
});

console.log(require('chalk').cyan(require('figlet').textSync(('Mergez.io'))))

// Run MultiOgar
const instance = new Server();
instance.start();

Logger.info("\u001B[1m\u001B[32mMultiOgar " + instance.version + "\u001B[37m - An open source multi-protocol By Alvariithoo\u001B[0m");

// Add command handler
instance.commands = Commands.list;

// Initialize the instance console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Console functions
function prompt() {
    in_.question(">", function (str) {
        try {
            parseCommands(str);
        } catch (err) {
            Logger.error(err.stack);
        } finally {
            setTimeout(prompt, 0);
        }
    });
}

function parseCommands(str) {
    // Log the string
    Logger.write(">" + str);

    // Don't process ENTER
    if (str === '')
        return;

    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Get command function
    var execute = instance.commands[first];
    if (typeof execute != 'undefined') {
        execute(instance, split);
    } else {
        Logger.warn("Invalid Command!");
    }
}