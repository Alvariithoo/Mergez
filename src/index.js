var figlet = require('figlet');
var runclient = require('./Client/client')
runclient()

////////////////////////////////////////
////////////////////////////////////////

// Imports
var Logger = require('./modules/Logger');
var Commands = require('./modules/CommandList');
var Server = require('./Server');

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
var server = new Server();
Logger.info("\u001B[1m\u001B[32mMultiOgar " + server.version + "\u001B[37m - An open source multi-protocol By Alvariithoo\u001B[0m");

server.start();

// Add command handler
server.commands = Commands.list;

// Run Minimap & Skins Server
// require('./socket');

// Initialize the server console
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
    var execute = server.commands[first];
    if (typeof execute != 'undefined') {
        execute(server, split);
    } else {
        Logger.warn("Invalid Command!");
    }
}