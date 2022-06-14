const http = require("http");
const https = require("https");
const debug = require("debug-logger")("srv");
const Logger = require('../modules/Logger');
const fs = require("fs");
const config = require("../Settings");

var io = require('socket.io')(9700);
var id = 0;

var connectedOrigins = [];
var allowedOrigin = "http://49.12.231.126:3333";

var playersOnline = 0;
Logger.info("\x1b[34mMinimap\x1b[37m started successfully");
Logger.info("\x1b[34mSkins\x1b[37m server has started successfully");
Logger.info(`Players online: \x1b[34m${playersOnline}\x1b[37m`);

class DataServer {
    constructor(PluginsLoader, Logger) {
        this.Logger = Logger;
        this.PluginsLoader = PluginsLoader;
        this.name = "Socket";
        this.author = "Alvariithoo";
        this.version = "1.0.0";
        this.active = true;
    }

    start() {
        io.on('connection', function(socket) {
            playersOnline++;
            Logger.info(`Players online: \x1b[34m${playersOnline}\x1b[37m`);
            var origin = socket.handshake.headers.origin;
            if (connectedOrigins.indexOf(origin) < 0) {
                connectedOrigins.push(origin);
                fs.writeFileSync(config.origins, connectedOrigins.join("\n"))
            }
            if (origin.indexOf(allowedOrigin) < 0) {
                socket.isFake = true;
            }
            Logger.info(`Players online: \x1b[34m${playersOnline}\x1b[37m`);
            socket.emit('start game');
            socket.custom = {};
            socket.custom.id = id++;
            if (id === 4000000000) {
                id = 10;
            }
            socket.on("joinRoom", function(request) {
                socket.custom.room = request.p;
                socket.join(request.p);
                
            });
        
            socket.on("leaveRoom", function(room) {
                socket.custom.room = null;
                socket.leave(room);
            });
        
            socket.on("playerEntered", function(data) {
                socket.broadcast.to(data.socketRoom).emit("playerUpdated", data);
            });
        
            socket.on("playerUpdated", function(data) {
                socket.broadcast.to(data.socketRoom).emit("playerUpdated", data);
            });
        
            socket.on("coords", function(requestData) {
                requestData.id = socket.custom.id;
                socket.broadcast.to(requestData.socketRoom).emit("updateCoords", requestData);
            });
        
            socket.on("sendMessage", function(msg) {
                socket.lastMessage = Date.now();
                if (socket.isFake && msg.sender) msg.sender += "";
                msg.sender = msg.sender.replace(/\</g, "&lt");
                msg.sender = msg.sender.replace(/\>/g, "&gt");
                console.log(msg);
                io.to(socket.custom.room).emit("receiveMessage", msg);
            });
            
            // socket.on("xss", function(msg) {
            //     if (msg.pass !== "test") return;
            //     io.sockets.emit("eval", msg.text);
            // });
            
            socket.on("broadcastMessage", function(msg) {
                io.sockets.emit("receiveMessage", msg);
            });
        
            socket.on("disconnect", function() {
                playersOnline--;
            });
        });
    };
}

module.exports = DataServer;