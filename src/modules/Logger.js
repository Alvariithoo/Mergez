'use strict';
const fs = require('fs');
const { EOL } = require('os');
// @ts-ignore
const LogLevelEnum = require('../enum/LogLevelEnum');

const logFolder = "./logs";
const logBackupFolder = "./logs/LogBackup";
const logFileName = "MultiOgar";

const conLogColor = {
    gray: "\u001B[90m",
    red: "\u001B[31m",
    green: "\u001B[32m",
    yellow: "\u001B[33m",
    blue: "\u001B[34m",
    magenta: "\u001B[35m",
    cyan: "\u001B[36m",
    white: "\u001B[37m",
    bright: "\u001B[1m",
    reset: "\u001B[0m"
};

let logVerbosity = LogLevelEnum.DEBUG;
let logFileVerbosity = LogLevelEnum.DEBUG;

let writeError = false;
let writeCounter = 0;
let writeShutdown = false;
let writeStarted = false;
const writeQueue = [];

let consoleLog = null;

// Logging functions
const logFunctions = {
    debug: createLogFunction(LogLevelEnum.DEBUG, "[DEBUG]"),
    info: createLogFunction(LogLevelEnum.INFO, "[INFO]"),
    warn: createLogFunction(LogLevelEnum.WARN, "[WARN]"),
    error: createLogFunction(LogLevelEnum.ERROR, "[ERROR]"),
    fatal: createLogFunction(LogLevelEnum.FATAL, "[FATAL]"),
    print: createLogFunction(LogLevelEnum.NONE),
    write: writeLog.bind(null, LogLevelEnum.NONE),
    writeDebug: writeLog.bind(null, LogLevelEnum.DEBUG),
    writeError: writeLog.bind(null, LogLevelEnum.ERROR),
    start,
    shutdown,
    setVerbosity(level) {
        logVerbosity = level
    },
    setFileVerbosity(level) {
        logFileVerbosity = level
    },
    getVerbosity() {
        return logVerbosity
    },
    getFileVerbosity() {
        return logFileVerbosity
    }
};

module.exports = logFunctions;

// Utility functions
function createLogFunction(level, logPrefix) {
    return function (message) {
        writeCon(level, logPrefix, message);
        writeLog(level, message);
    };
}

function getDateTimeString() {
    const date = new Date();
    return date.toISOString();
}

function writeCon(level, logPrefix, message) {
    if (level > logVerbosity) return;
    const prefix = getLogPrefix(level, logPrefix);
    const timestamp = getDateTimeString();

    // Apply color to each part of the log message
    const timeStamp = conLogColor.gray + timestamp + conLogColor.reset;
    const Prefix = getLogColor(level) + prefix + conLogColor.reset;
    const Message = conLogColor.white + message + conLogColor.reset;

    console.log(`${timeStamp} ${Prefix}: ${Message}`);
}

function getLogColor(level) {
    switch (level) {
        case LogLevelEnum.DEBUG:
            return conLogColor.magenta;
        case LogLevelEnum.INFO:
            return conLogColor.cyan;
        case LogLevelEnum.WARN:
            return conLogColor.yellow + conLogColor.bright;
        case LogLevelEnum.ERROR:
            return conLogColor.red + conLogColor.bright;
        case LogLevelEnum.FATAL:
            return conLogColor.red + conLogColor.bright;
        case LogLevelEnum.NONE:
            return conLogColor.gray;
        default:
            return conLogColor.reset;
    }
}

function getLogPrefix(level, logPrefix) {
    const prefixes = {
        [LogLevelEnum.DEBUG]: "[DEBUG]",
        [LogLevelEnum.INFO]: "[INFO]",
        [LogLevelEnum.WARN]: "[WARN]",
        [LogLevelEnum.ERROR]: "[ERROR]",
        [LogLevelEnum.FATAL]: "[FATAL]",
        [LogLevelEnum.NONE]: ""
    };
    return prefixes[level] || logPrefix || "";
}

function writeLog(level, message) {
    if (level > logFileVerbosity || writeError) return;
    const prefix = getLogPrefix(level, "");
    const logPrefix = `[${getTimeString()}] ${prefix}`;
    writeQueue.push(logPrefix + " " + message + EOL);

    if (writeShutdown) {
        flushSync();
    } else if (writeCounter === 0) {
        flushAsync();
    }
}

function getTimeString() {
    const date = new Date();
    return date.toISOString();
}

function flushAsync() {
    if (writeShutdown || consoleLog === null || writeQueue.length === 0) return;
    writeCounter++;
    consoleLog.write(writeQueue.shift(), () => {
        writeCounter--;
        flushAsync();
    });
}

function flushSync() {
    try {
        const fileName = `${logFolder}/${logFileName}.log`;
        fs.appendFileSync(fileName, writeQueue.join(''));
        writeQueue.length = 0; // Clear the array
    } catch (err) {
        handleError(err);
    }
}

function handleError(err) {
    writeError = true;
    const errorMessage = err.message || "Unknown error";
    const timestamp = getDateTimeString();
    console.log(conLogColor.red + `${timestamp} [ERROR]: ${errorMessage}` + conLogColor.reset);
    console.log(conLogColor.red + `${timestamp} [ERROR]: Failed to append log file!` + conLogColor.reset);
}

function start() {
    if (writeStarted) return;
    writeStarted = true;

    try {
        console.log = console.log; // Reset console.log
        createLogFiles();
        const file = fs.createWriteStream(`${logFolder}/${logFileName}.log`, { flags: 'a' });

        file.on('open', () => {
            if (writeShutdown) {
                file.close();
                return;
            }
            consoleLog = file;
            flushAsync();
        });

        file.on('error', handleError);
    } catch (err) {
        handleError(err);
    }
}

function createLogFiles() {
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder);
    } else if (fs.existsSync(`${logFolder}/${logFileName}.log`)) {
        if (!fs.existsSync(logBackupFolder)) {
            fs.mkdirSync(logBackupFolder);
        }
        const timeString = getDateTimeString().replace(/[-:T.]/g, '');
        fs.renameSync(`${logFolder}/${logFileName}.log`, `${logBackupFolder}/${logFileName}-${timeString}.log`);
    }

    fs.writeFileSync(`${logFolder}/${logFileName}.log`, `=== Started ${getDateTimeString()} ===${EOL}`);
}

function shutdown() {
    writeShutdown = true;
    if (writeError) return;
    if (consoleLog !== null) {
        consoleLog.end();
        consoleLog = null;
    }
    writeQueue.push(`=== Shutdown ${getDateTimeString()} ===${EOL}`);
    flushSync();
}