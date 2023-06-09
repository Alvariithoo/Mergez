// Imports
const Logger = require('./modules/Logger');
const Commands = require('./modules/CommandList');
const Server = require('./Server');
const Manager = require('./wager/Manager');

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

const manager = new Manager({ port: 9000 });
manager.init();