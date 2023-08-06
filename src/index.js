'use strict';
const Logger = require('./modules/Logger');
const Commands = require('./modules/CommandList');
const Server = require('./Server');
const chalk = require('chalk');
const figlet = require('figlet');
const readline = require('readline');
const Earn = require('./modules/EarnSystem');

// Init variables
let showConsole = true;

// Start msg
Logger.start();

process.on('exit', (code) => {
    Logger.debug(`process.exit(${code})`);
    Logger.shutdown();
});

process.on('uncaughtException', (err) => {
    Logger.fatal(err.stack);
    process.exit(1);
});

console.log(chalk.cyan(figlet.textSync('Mergez.io')));

// Connect to MongoDB
const MongoDB = new Earn();
MongoDB.startMongoDB();

// Run MultiOgar
const instance = new Server();
instance.start();

const versionInfo = `MultiOgar ${instance.version} - An open source multi-protocol By Alvariithoo`;
Logger.info(`\u001B[1m\u001B[32m${versionInfo}\u001B[37m\u001B[0m`);

// Add command handler
instance.commands = Commands.list;

// Initialize the instance console
if (showConsole) {
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Console functions
function prompt() {
    in_.question('>', (str) => {
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
    Logger.write(`>${str}`);

    // Don't process ENTER
    if (str === '') return;

    // Splits the string
    const split = str.split(' ');

    // Process the first string value
    const first = split[0].toLowerCase();

    // Get command function
    const execute = instance.commands[first];
    if (typeof execute !== 'undefined') {
        execute(instance, split);
    } else {
        Logger.warn('Invalid Command!');
    }
}