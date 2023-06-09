const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const Logger = require('../modules/Logger');
const Client = require('./Client');
const path = require('path');
const Colors = require('./Colors');

const fileNameBadWords = path.resolve(__dirname, '../badwords.txt');

class Manager {
    constructor({ port }) {
        this.version = "v0.0.1-BETA";
        this.httpServer = http.createServer();
        this.port = port;
        this.sockets = new Set();
        this.rooms = new Map();
        this.colors = new Colors();

        this.ActionEnum = Object.freeze({
            MESSAGE: 'message',
            SET_NICK: 'nickname',
            ERROR: 'error',
            CREATE_ROOM: 'create_room',
            INITIALIZED_ROOM: 'created_room',
            CLOSE_ROOM: 'close_room',
            JOIN_ROOM: 'join_room',
            STARTING_ROOM: 'start_room',
            ENDGAME: 'endgame',
            UPDATE: 'update'
        });
        this.welcomeMessages = [
            `Welcome in Wager! (${this.version})`,
            "NOTE: It's still in early development. If you find any bugs, report them in our discord!"
        ];

        // additional config
        this.socketTimeout = 5 * 60;
        this.chatMessagesThreshold = 3;
        this.chatMessagesLimit = 4;

        this.loadBadWords();
        Logger.info("Loaded " + this.colors.list.length + " colors");
    }
    init() {
        const wsOptions = {
            server: this.httpServer,
            perMessageDeflate: false,
            maxPayload: 4096
        }
        this.wss = new WebSocket.Server(wsOptions);
        this.wss.on('connection', (socket) => {
            this.sockets.add(socket);
            socket.nickname = "Guest for now";
            socket.color = this.colors.randomColor();
            socket.client = new Client(this, socket);
            socket.lastSeen = new Date().valueOf();
            this.welcomeMessages.forEach(message => {
                socket.client.sendChatMessage(null, message);
            });
            Logger.info("Player connected (" + socket._socket.remoteAddress + ":" + socket._socket.remotePort + ")");
            socket.on('message', (data) => {
                socket.client.handleMessage(data);
            });
            socket.on('close', () => {
                Logger.info("Player disconnected (" + socket._socket.remoteAddress + ":" + socket._socket.remotePort + ")")
                socket.client.close();
                this.update();
            })
            this.update();
        });
        this.httpServer.listen(this.port);

        Logger.info("\x1b[32mWAGER\x1b[37m Manager ("+this.version+") running on port \x1b[34m" + this.port + "\x1b[37m");

        this.mainLoop();
    }
    mainLoop() {
        setInterval(() => {
            this.updateClients();
        }, 1E3);
    }
    emit(message) {
        this.sockets.forEach(socket => {
            socket.client.send(message);
        })
    }
    update() {
        this.sockets.forEach(socket => {
            socket.client.update();
        })
    }
    updateClients() {
        this.sockets.forEach(socket => {
            if(socket.client.isPlaying) socket.lastSeen = new Date().valueOf();
            else if(new Date().valueOf() - socket.lastSeen > this.socketTimeout * 1E3) {
                socket.client.sendChatMessage(null, "Disconnected. You have been timed out!");
                socket.client.close();
                socket.close();
            }
        });
    }
    loadBadWords() {
        try {
            if (!fs.existsSync(fileNameBadWords)) {
                Logger.warn(fileNameBadWords + " not found");
            } else {
                var words = fs.readFileSync(fileNameBadWords, 'utf-8');
                words = words.split(/[\r\n]+/);
                words = words.map(function (arg) {
                    return arg.trim().toLowerCase();
                });
                words = words.filter(function (arg) {
                    return !!arg;
                });
                this.badWords = words;
                Logger.info(this.badWords.length + " bad words loaded");
            }
        } catch (err) {
            Logger.error(err.stack);
            Logger.error("Failed to load " + fileNameBadWords + ": " + err.message);
        }
    }
    checkBadWord(value) {
        if (!value) return false;
        value = value.toLowerCase().trim();
        if (!value) return false;
        for (var i = 0; i < this.badWords.length; i++) {
            if (value.indexOf(this.badWords[i]) >= 0) {
                return true;
            }
        }
        return false;
    }
    async randomPort() {
        const { default: getPort, portNumbers } = await import('get-port');
        return await getPort({ port: portNumbers(2e4,3e4) });
    }
}

module.exports = Manager;