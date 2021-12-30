// Library imports 
const http = require('http');
const https = require('https');
const fs = require("fs");
const path = require('path');
const QuadNode = require('quad-node');
const PlayerCommand = require('./modules/PlayerCommand');
const day = require('./modules/date');
const WebSocket = require("ws");

// Project imports
const Packet = require('./packet');
const Player = require('./Player');
const Client = require('./Client');
const Entity = require('./entity');
const Gamemode = require('./gamemodes');
const BotLoader = require('./ai/BotLoader');
const Logger = require('./modules/Logger');
const UserRoleEnum = require('./enum/UserRoleEnum');
const Plugins = require('./PluginsLoader');

// Files imports
const fileNameBadWords = '../src/badwords.txt';
const fileNameIpBan = '../src/ipbanlist.txt';
const fileNameUsers = '../src/modules/userRoles.json';

// Server implementation
class Server {
    constructor() {
        this.httpServer = null;
        this.wsServer = null;

        // Startup
        this.run = true;
        this.version = '2.0';
        this.stop = false; //for deleting server
        this.lastNodeId = 1;
        this.lastPlayerId = 1;
        this.clients = [];
        this.socketCount = 0;
        this.largestClient; // Required for spectators
        this.nodes = [];
        this.nodesVirus = []; // Virus nodes
        this.nodesEjected = []; // Ejected mass nodes
        this.quadTree = null;

        this.currentFood = 0;
        this.boostersCount = {
            // <cell type>: count
        }

        this.movingNodes = []; // For move engine
        this.leaderboard = [];
        this.leaderboardType = -1; // no type

        this.bots = new BotLoader(this);
        this.Plugins = new Plugins(this);
        this.commands; // Command handler

        // Main loop tick
        this.startTime = Date.now();
        this.stepDateTime = 0;
        this.timeStamp = 0;
        this.updateTime = 0;
        this.updateTimeAvg = 0;
        this.timerLoopBind = null;
        this.mainLoopBind = null;

        this.tickCounter = 0;

        this.setBorder(10000, 10000);

        // Config
        this.config = require("./Settings.js");

        this.ipBanList = [];
        this.minionTest = [];
        this.userList = [];
        this.badWords = [];

        // Parse config
        this.loadIpBanList();
        this.loadUserList();
        this.loadBadWords();

        this.setBorder(this.config.borderWidth, this.config.borderHeight);
        this.quadTree = new QuadNode(this.border, 64, 32);
    }

    start() {
        this.Plugins.load();
        this.timerLoopBind = this.timerLoop.bind(this);
        this.mainLoopBind = this.mainLoop.bind(this);

        // Gamemodes
        this.gameMode = Gamemode.get(this.config.serverGamemode);

        // Gamemode configurations
        this.gameMode.onServerInit(this);
        var dirSsl = path.join(path.dirname(module.filename), '../ssl');
        var pathKey = path.join(dirSsl, 'key.pem');
        var pathCert = path.join(dirSsl, 'cert.pem');

        if (fs.existsSync(pathKey) && fs.existsSync(pathCert)) {
            // HTTP/TLS
            var options = {
                key: fs.readFileSync(pathKey, 'utf8'),
                cert: fs.readFileSync(pathCert, 'utf8')
            };
            Logger.info("TLS: supported");
            this.httpServer = HttpsServer.createServer(options);
        } else {
            // HTTP only
            Logger.warn("TLS: not supported (SSL certificate not found!)");
            this.httpServer = http.createServer();
        }
        var wsOptions = {
            server: this.httpServer,
            perMessageDeflate: false,
            maxPayload: 4096
        };
        // Logger.info("WebSocket: " + this.config.serverWsModule);
        // WebSocket = require(this.config.serverWsModule);
        // Custom prototype functions^M
        WebSocket.prototype.sendPacket = function (packet) {
            if (packet == null) return;
            if (this.readyState == WebSocket.OPEN) {
                if (this._socket.writable != null && !this._socket.writable) {
                    return;
                }
                var buffer = packet.build(this.player.socket.client.protocol);
                if (buffer != null) {
                    this.send(buffer, { binary: true });
                }
            } else {
                this.readyState = WebSocket.CLOSED;
            }
        };

        this.wsServer = new WebSocket.Server(wsOptions);
        this.wsServer.on('error', this.onServerSocketError.bind(this));
        this.wsServer.on('connection', this.onClientSocketOpen.bind(this));
        this.httpServer.listen(this.config.serverPort, this.config.serverBind, this.onHttpServerOpen.bind(this));

        this.startStatsServer(this.config.serverStatsPort);
    };

    onHttpServerOpen() {
        // Spawn starting food
        this.startingFood();

        // Start Main Loop
        setTimeout(this.timerLoopBind, 1);

        // Done
        Logger.info("GAMESERVER'S PORT: \x1b[34m" + this.config.serverPort + "\x1b[0m");
        Logger.info("Current game mode is: \x1b[34m" + this.gameMode.name + "\x1b[0m");

        // Player bots (Experimental)
        if (this.config.serverBots > 0) {
            for (var i = 0; i < this.config.serverBots; i++) {
                this.bots.addBot();
            }
            Logger.info("Added " + this.config.serverBots + " player bots");
        }
    };

    onServerSocketError(error) {
        Logger.error("WebSocket: " + error.code + " - " + error.message);
        switch (error.code) {
            case "EADDRINUSE":
                Logger.error("Server could not bind to port " + this.config.serverPort + "!");
                Logger.error("Please close out of Skype or change 'serverPort' in Settings.js to a different number.");
                break;
            case "EACCES":
                Logger.error("Please make sure you are running Ogar with root privileges.");
                break;
        }
        process.exit(1); // Exits the program
    };

    onClientSocketOpen(ws) {
        var logip = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
        ws.on('error', function (err) {
            Logger.writeError("[" + logip + "] " + err.stack);
        });
        if (this.config.serverMaxConnections > 0 && this.socketCount >= this.config.serverMaxConnections) {
            ws.close(1000, "No slots");
            return;
        }
        if (this.checkIpBan(ws._socket.remoteAddress)) {
            ws.close(1000, "IP banned");
            return;
        }
        if (this.config.serverIpLimit > 0) {
            var ipConnections = 0;
            for (var i = 0; i < this.clients.length; i++) {
                var socket = this.clients[i];
                if (!socket.isConnected || socket.remoteAddress != ws._socket.remoteAddress)
                    continue;
                ipConnections++;
            }
            if (ipConnections >= this.config.serverIpLimit) {
                ws.close(1000, "IP limit reached");
                return;
            }
        }
        ws.isConnected = true;
        ws.remoteAddress = ws._socket.remoteAddress;
        ws.remotePort = ws._socket.remotePort;
        ws.lastAliveTime = Date.now();
        Logger.write("CONNECTED    " + ws.remoteAddress + ":" + ws.remotePort + ", origin: \"" + "\"");

        console.log(day() + " CONNECTED: " + ws.remoteAddress + ":" + ws.remotePort);

        ws.player = new Player(this, ws);
        ws.client = new Client(this, ws);
        ws.playerCommand = new PlayerCommand(this, ws.player);

        var self = this;
        var onMessage = function (message) {
            self.onClientSocketMessage(ws, message);
        };
        var onError = function (error) {
            self.onClientSocketError(ws, error);
        };
        var onClose = function (reason) {
            self.onClientSocketClose(ws, reason);
        };
        ws.on('message', onMessage);
        ws.on('error', onError);
        ws.on('close', onClose);
        this.socketCount++;
        this.clients.push(ws);

        // Minion detection
        if (this.config.serverMinionThreshold) {
            if ((ws.lastAliveTime - this.startTime) / 1000 >= this.config.serverMinionIgnoreTime) {
                if (this.minionTest.length >= this.config.serverMinionThreshold) {
                    ws.player.isMinion = true;
                    for (var i = 0; i < this.minionTest.length; i++) {
                        var player = this.minionTest[i];
                        if (!player.socket.isConnected) continue;
                        player.isMinion = true;
                    }
                    if (this.minionTest.length) {
                        this.minionTest.splice(0, 1);
                    }
                }
                this.minionTest.push(ws.player);
            }
        }
    };

    onClientSocketClose(ws, code) {
        if (ws._socket && ws._socket.destroy != null && typeof ws._socket.destroy == 'function') {
            ws._socket.destroy();
        }
        if (this.socketCount < 1) {
            Logger.debug("Server.onClientSocketClose: socketCount=" + this.socketCount);
        } else {
            this.socketCount--;
        }
        ws.isConnected = false;
        ws.sendPacket = function (data) {};
        ws.closeReason = {
            code: ws._closeCode,
            message: ws._closeMessage
        };
        ws.closeTime = Date.now();
        Logger.write("DISCONNECTED " + ws.remoteAddress + ":" + ws.remotePort + ", code: " + ws._closeCode + ", reason: \"" + ws._closeMessage + "\", name: \"" + ws.player.getName() + "\"");
        console.log(day() + " DISCONNECTED: " + ws.remoteAddress + ":" + ws.remotePort + ", code: " + ws._closeCode + ", reason: \"" + ws._closeMessage + "\", name: \"" + ws.player.getName() + "\"");
        // disconnected effect
        var color = this.getGrayColor(ws.player.getColor());
        ws.player.setColor(color);
        ws.player.setSkin("");
        ws.player.cells.forEach(function (cell) {
            cell.setColor(color);
        }, this);

        if (this.gameMode) {
            this.gameMode.onClientSocketClose(this, ws);
        }
    };

    onClientSocketError(ws, error) {
        ws.sendPacket = function (data) {};
    };

    onClientSocketMessage(ws, message) {
        if (message.length == 0) {
            return;
        }
        if (message.length > 256) {
            ws.close(1009, "Spam");
            return;
        }
        ws.client.handleMessage(message);
    };

    restart() { // Alvariithoo make this code :O
        this.sendChatMessage(null, null, this.config.restartMessage);
        while (this.nodes.length > 0) {
            var node = this.nodes[0];
            node && this.removeNode(node);
        }
        this.loadIpBanList();
        this.loadUserList();
        this.loadBadWords();
    };

    setBorder(width, height) {
        var hw = width / 2;
        var hh = height / 2;
        this.border = {
            minx: -hw,
            miny: -hh,
            maxx: hw,
            maxy: hh,
            width: width,
            height: height,
            centerx: 0,
            centery: 0
        };
    };

    getTick() {
        return this.tickCounter;
    };

    getMode() {
        return this.gameMode;
    };

    getNextNodeId() {
        // Resets integer
        if (this.lastNodeId > 2147483647) {
            this.lastNodeId = 1;
        }
        return this.lastNodeId++ >>> 0;
    };

    getNewPlayerID() {
        // Resets integer
        if (this.lastPlayerId > 2147483647) {
            this.lastPlayerId = 1;
        }
        return this.lastPlayerId++ >>> 0;
    };

    getRandomPosition() {
        return {
            x: Math.floor(this.border.minx + this.border.width * Math.random()),
            y: Math.floor(this.border.miny + this.border.height * Math.random())
        };
    };

    getGrayColor(rgb) {
        var luminance = Math.min(255, (rgb.r * 0.2125 + rgb.g * 0.7154 + rgb.b * 0.0721)) >>> 0;
        return {
            r: luminance,
            g: luminance,
            b: luminance
        };
    };

    getRandomColor() {
        var h = 360 * Math.random();
        var s = 248 / 255;
        var v = 1;

        // hsv to rgb    
        var rgb = { r: v, g: v, b: v }; // achromatic (grey)
        if (s > 0) {
            h /= 60; // sector 0 to 5
            var i = Math.floor(h) >> 0;
            var f = h - i; // factorial part of h
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));
            switch (i) {
                case 0:
                    rgb = { r: v, g: t, b: p };
                    break
                case 1:
                    rgb = { r: q, g: v, b: p };
                    break
                case 2:
                    rgb = { r: p, g: v, b: t };
                    break
                case 3:
                    rgb = { r: p, g: q, b: v };
                    break
                case 4:
                    rgb = { r: t, g: p, b: v };
                    break
                default:
                    rgb = { r: v, g: p, b: q };
                    break
            }
        }
        // check color range
        rgb.r = Math.max(rgb.r, 0);
        rgb.g = Math.max(rgb.g, 0);
        rgb.b = Math.max(rgb.b, 0);
        rgb.r = Math.min(rgb.r, 1);
        rgb.g = Math.min(rgb.g, 1);
        rgb.b = Math.min(rgb.b, 1);
        return {
            r: (rgb.r * 255) >>> 0,
            g: (rgb.g * 255) >>> 0,
            b: (rgb.b * 255) >>> 0
        };
    };

    movePlayer(cell1, client) {
        var dx = ~~(client.mouse.x - cell1.position.x);
        var dy = ~~(client.mouse.y - cell1.position.y);
        var squared = dx * dx + dy * dy;
        if (squared < 1 || isNaN(dx) || isNaN(dy)) {
            return;
        }
        // get movement speed
        var d = Math.sqrt(squared);
        if (client.doublespeed) {
            if (server)
                speed = cell1.getSpeed(d) * 4;
            else speed = cell1.getSpeed(d) * 2;
        } else if (client.FreezeCell) {
            if (server)
                speed = cell1.getSpeed(d) * 0;
            else speed = cell1.getSpeed(d) * 2;
        } else speed = cell1.getSpeed(d);
        if (!speed) return; // avoid shaking

        // move player cells
        cell1.position.x += dx / d * speed;
        cell1.position.y += dy / d * speed;
    };

    updateNodeQuad(node) {
        var item = node.quadItem;
        if (item == null) {
            throw new TypeError("Server.updateNodeQuad: quadItem is null!");
        }
        var x = node.position.x;
        var y = node.position.y;
        var size = node.getSize();
        // check for change
        if (item.x === x && item.y === y && item.size === size) {
            return;
        }
        // update quad tree
        item.x = x;
        item.y = y;
        item.size = size;
        item.bound.minx = x - size;
        item.bound.miny = y - size;
        item.bound.maxx = x + size;
        item.bound.maxy = y + size;
        this.quadTree.update(item);
    };

    addNode(node) {
        var x = node.position.x;
        var y = node.position.y;
        var size = node.getSize();
        node.quadItem = {
            cell: node,
            x: x,
            y: y,
            size: size,
            bound: {
                minx: x - size,
                miny: y - size,
                maxx: x + size,
                maxy: y + size
            }
        };
        this.quadTree.insert(node.quadItem);

        this.nodes.push(node);

        // Adds to the owning player's screen
        if (node.owner) {
            node.setColor(node.owner.getColor());
            node.owner.cells.push(node);
            node.owner.socket.sendPacket(new Packet.AddNode(node.owner, node));
        }

        // Special on-add actions
        node.onAdd(this);
    };

    removeNode(node) {
        if (node.quadItem == null) {
            throw new TypeError("Server.removeNode: attempt to remove invalid node!");
        }
        node.isRemoved = true;
        this.quadTree.remove(node.quadItem);
        node.quadItem = null;

        // Remove from main nodes list
        var index = this.nodes.indexOf(node);
        if (index != -1) {
            this.nodes.splice(index, 1);
        }

        // Remove from moving cells list
        index = this.movingNodes.indexOf(node);
        if (index != -1) {
            this.movingNodes.splice(index, 1);
        }

        // Special on-remove actions
        node.onRemove(this);
    };

    updateClients() {
        // check minions
        for (var i = 0; i < this.minionTest.length;) {
            var player = this.minionTest[i];
            if (this.stepDateTime - player.connectedTime > this.config.serverMinionInterval) {
                this.minionTest.splice(i, 1);
            } else {
                i++;
            }
        }
        // check dead clients
        for (var i = 0; i < this.clients.length;) {
            var player = this.clients[i].player;
            player.checkConnection();
            if (player.isRemoved) {
                // remove dead client
                this.clients.splice(i, 1);
            } else {
                i++;
            }
        }
        // update
        for (var i = 0; i < this.clients.length; i++) {
            this.clients[i].player.updateTick();
        }
        for (var i = 0; i < this.clients.length; i++) {
            this.clients[i].player.sendUpdate();
        }
    };

    updateLeaderboard() {
        // Update leaderboard with the gamemode's method
        this.leaderboard = [];
        this.leaderboardType = -1;
        this.gameMode.updateLB(this);

        if (!this.gameMode.specByLeaderboard) {
            // Get client with largest score if gamemode doesn't have a leaderboard
            var clients = this.clients.valueOf();

            // Use sort function
            clients.sort(function (a, b) {
                return b.player.getScore() - a.player.getScore();
            });
            //this.largestClient = clients[0].player;
            this.largestClient = null;
            if (clients[0] != null)
                this.largestClient = clients[0].player;
        } else {
            this.largestClient = this.gameMode.rankOne;
        }
    };

    useAbility(id, tracker) {
        switch (id) {
            case 1:
                let vector = {
                    x: tracker.mouse.x,
                    y: tracker.mouse.y
                };
                var virus = new Entity.Virus(this, null, vector, this.config.virusMinSize);
                this.addNode(virus);
                break;
            case 2:
                let vector2 = {
                    x: tracker.mouse.x,
                    y: tracker.mouse.y
                };
                var Minions = new Entity.Minions(this, null, vector2);
                this.addNode(Minions);
                break;
            default:
                console.log("invalid id");
                break;
        }
    };

    onChatMessage(from, to, message) {
        if (message == null) return;
        message = message.trim();
        if (message == "") return;
        if (from && message.length > 0 && message[0] == '/') {
            // player command
            message = message.slice(1, message.length);
            from.socket.playerCommand.executeCommandLine(message);
            return;
        }
        if (!this.config.serverChat) {
            // chat is disabled
            return;
        }
        if (from && from.isMuted) {
            // player is muted
            return;
        }
        if (message.length > 64) {
            message = message.slice(0, 64);
        }
        if (this.config.serverChatAscii) {
            for (var i = 0; i < message.length; i++) {
                var c = message.charCodeAt(i);
                if (c < 0x20 || c > 0x7F) {
                    if (from) {
                        this.sendChatMessage(null, from, "You can use ASCII text only!");
                    }
                    return;
                }
            }
        }
        if (this.checkBadWord(message)) {
            if (from) {
                this.sendChatMessage(null, from, "Stop insulting others! Keep calm and be friendly please");
            }
            return;
        }
        if (from) {
            Logger.writeDebug("[CHAT][" + from.socket.remoteAddress + ":" + from.socket.remotePort + "][" + from.getFriendlyName() + "] " + message);
        } else {
            Logger.writeDebug("[CHAT][][]: " + message);
        }
        this.sendChatMessage(from, to, message);
    };

    // sendChatMessage(from, to, message) {
    //     for (var i = 0; i < this.clients.length; i++) {
    //         var client = this.clients[i];
    //         if (client == null) continue;
    //         if (!to || to == this.clients[i].player) {
    //             if (this.config.separateChatForTeams && this.gameMode.haveTeams) {
    //                 if (from == null /*server*/ || from.team === this.clients[i].player.team) {
    //                     client.sendPacket(new Packet.ChatMessage(from, message, client.player));
    //                 }
    //             } else {
    //                 client.sendPacket(new Packet.ChatMessage(from, message, client.player));
    //             }
    //         }
    //     }
    // };
    sendChatMessage(from, to, message) {
        for (var i = 0, len = this.clients.length; i < len; i++) {
            if (!this.clients[i])
                continue;
            if (!to || to == this.clients[i].player) {
                if (this.config.separateChatForTeams && this.gameMode.haveTeams) {
                    //  from equals null if message from server
                    if (from == null || from.team === this.clients[i].player.team) {
                        this.clients[i].client.sendPacket(new Packet.ChatMessage(from, message));
                    }
                }
                else {
                    this.clients[i].client.sendPacket(new Packet.ChatMessage(from, message));
                }
            }
        }
    };
    timerLoop() {
        if (this.stop) {
            return;
        }
        var timeStep = 40;

        var ts = Date.now();
        var dt = ts - this.timeStamp;
        if (dt < timeStep - 5) {
            setTimeout(this.timerLoopBind, ((timeStep - 5) - dt) >> 0);
            return;
        }
        if (dt < timeStep - 1) {
            setTimeout(this.timerLoopBind, 0);
            return;
        }
        if (dt < timeStep) {
            //process.nextTick(this.timerLoopBind);
            setTimeout(this.timerLoopBind, 0);
            return;
        }
        if (dt > 120) {
            // too high lag => resynchronize
            this.timeStamp = ts - timeStep;
        }
        // update average
        this.updateTimeAvg += 0.5 * (this.updateTime - this.updateTimeAvg);
        // calculate next
        if (this.timeStamp == 0)
            this.timeStamp = ts;
        this.timeStamp += timeStep;
        //process.nextTick(this.mainLoopBind);
        //process.nextTick(this.timerLoopBind);
        setTimeout(this.mainLoopBind, 0);
        setTimeout(this.timerLoopBind, 0);
    };

    mainLoop() {
        if (this.stop) {
            return;
        }
        this.stepDateTime = Date.now();
        var tStart = process.hrtime();

        // Loop main functions
        if (this.run) {
            this.updateMoveEngine();
            if ((this.getTick() % this.config.spawnInterval) == 0) {
                this.updateFood(); // Spawn food
                this.updateVirus(); // Spawn viruses
            }
            this.gameMode.onTick(this);
            if (((this.getTick() + 3) % (1000 / 40)) == 0) {
                // once per second
                this.updateMassDecay();
            }
        }
        //to fix lag when tournament stucks at start
        if (!this.run && this.gameMode.IsTournament) {
            this.tickCounter++;
        }

        this.updateClients();

        // once per second
        if (((this.getTick() + 7) % (1000 / 40)) == 0) {
            // once per second
            this.updateLeaderboard();
        }

        // ping server tracker
        if (this.config.serverTracker && (this.getTick() % (10000 / 40)) == 0) {
            // once per 30 seconds
            this.pingServerTracker();
        }

        if (this.run) {
            this.tickCounter++;
        }
        var tEnd = process.hrtime(tStart);
        this.updateTime = tEnd[0] * 1000 + tEnd[1] / 1000000;
    };

    startingFood() {
        // Spawns the starting amount of food cells
        for (var i = 0; i < this.config.foodMinAmount; i++) {
            this.spawnFood();
        }
    };

    updateFood() {
        var maxCount = this.config.foodMinAmount - this.currentFood;
        var spawnCount = Math.min(maxCount, this.config.foodSpawnAmount);
        for (var i = 0; i < spawnCount; i++) {
            this.spawnFood();
        }
    };

    updateVirus() {
        var maxCount = this.config.virusMinAmount - this.nodesVirus.length;
        var spawnCount = Math.min(maxCount, 2);
        for (var i = 0; i < spawnCount; i++) {
            this.spawnVirus();
        }
    };

    spawnFood() {
        var cell = new Entity.Food(this, null, this.getRandomPosition(), this.config.foodMinSize);
        if (this.config.foodMassGrow) {
            var size = cell.getSize();
            var maxGrow = this.config.foodMaxSize - size;
            size += maxGrow * Math.random();
            cell.setSize(size);
        }
        cell.setColor(this.getRandomColor());
        this.addNode(cell);
    };

    spawnVirus() {
        // Spawns a virus
        var pos = this.getRandomPosition();
        if (this.willCollide(pos, this.config.virusMinSize)) {
            // cannot find safe position => do not spawn
            return;
        }
        var v = new Entity.Virus(this, null, pos, this.config.virusMinSize);
        this.addNode(v);
    };

    spawnPlayer(player, pos, size) {
        // Check if can spawn from ejected mass
        if (!pos && this.config.ejectSpawnPlayer && this.nodesEjected.length > 0) {
            if (Math.random() >= 0.5) {
                // Spawn from ejected mass
                var index = (this.nodesEjected.length - 1) * Math.random() >>> 0;
                var eject = this.nodesEjected[index];
                if (!eject.isRemoved) {
                    this.removeNode(eject);
                    pos = {
                        x: eject.position.x,
                        y: eject.position.y
                    };
                    if (!size) {
                        size = Math.max(eject.getSize(), Math.max(player.startingSize ? player.startingSize : this.config.playerStartSize, this.config.playerStartSize));
                    }
                }
            }
        }

        if (size == null) {
            // Get starting mass
            size = Math.max(player.startingSize ? player.startingSize : this.config.playerStartSize, this.config.playerStartSize);
        }

        if (player.spawnmass) { // for changing spawn mass during game
            size = player.spawnmass;
        }

        if (pos == null) {
            // Get random pos
            var pos = this.getRandomPosition();
            // 10 attempts to find safe position
            for (var i = 0; i < 10 && this.willCollide(pos, size); i++) {
                pos = this.getRandomPosition();
            }
        }

        // pos = {x : 0, y: 0};
        var name = player.getName();
        if (name.length > this.config.playerMaxNickLength) {
            name = name.substring(0, this.config.playerMaxNickLength);
        }
        player.setName(name);



        // Spawn player and add to world
        var cell = new Entity.PlayerCell(this, player, pos, size);
        this.addNode(cell);

        // Set initial mouse coords
        player.mouse = {
            x: pos.x,
            y: pos.y
        };
    };

    willCollide(pos, size) {
        // Look if there will be any collision with the current nodes
        var bound = {
            minx: pos.x - size,
            miny: pos.y - size,
            maxx: pos.x + size,
            maxy: pos.y + size
        };
        return this.quadTree.any(
            bound,
            function (item) {
                return item.cell.cellType == 0; // check players only
            });
    };

    // Checks cells for collision.
    // Returns collision manifold or null if there is no collision
    checkCellCollision(cell, check) {
        var r = cell.getSize() + check.getSize();
        var dx = check.position.x - cell.position.x;
        var dy = check.position.y - cell.position.y;
        var squared = dx * dx + dy * dy; // squared distance from cell to check
        if (squared > r * r) {
            // no collision
            return null;
        }
        // create collision manifold
        return {
            cell1: cell,
            cell2: check,
            r: r, // radius sum
            dx: dx, // delta x from cell1 to cell2
            dy: dy, // delta y from cell1 to cell2
            squared: squared // squared distance from cell1 to cell2
        };
    };

    // Resolves rigid body collision
    resolveRigidCollision(manifold, border) {
        // distance from cell1 to cell2
        var d = Math.sqrt(manifold.squared);
        if (d <= 0) return;
        var invd = 1 / d;

        // normal
        var nx = ~~manifold.dx * invd;
        var ny = ~~manifold.dy * invd;

        // body penetration distance
        var penetration = manifold.r - d;
        if (penetration <= 0) return;

        // penetration vector = penetration * normal
        var px = penetration * nx;
        var py = penetration * ny;

        // body impulse
        var totalMass = manifold.cell1.getSizeSquared() + manifold.cell2.getSizeSquared();
        if (totalMass <= 0) return;
        var invTotalMass = 1 / totalMass;
        var impulse1 = manifold.cell2.getSizeSquared() * invTotalMass;
        var impulse2 = manifold.cell1.getSizeSquared() * invTotalMass;

        // apply extrusion force
        manifold.cell1.position.x -= px * impulse1;
        manifold.cell1.position.y -= py * impulse1;
        manifold.cell2.position.x += px * impulse2;
        manifold.cell2.position.y += py * impulse2;
        // clip to border bounds
        manifold.cell1.checkBorder(border);
        manifold.cell2.checkBorder(border);
    };

    // Checks if collision is rigid body collision
    checkRigidCollision(manifold) {
        if (!manifold.cell1.owner || !manifold.cell2.owner)
            return false;
        if (manifold.cell1.owner != manifold.cell2.owner) {
            // Different owners
            return this.gameMode.haveTeams &&
                manifold.cell1.owner.getTeam() == manifold.cell2.owner.getTeam();
        }
        // The same owner
        if (manifold.cell1.owner.mergeOverride)
            return false;
        var tick = this.getTick();
        if (manifold.cell1.getAge(tick) < 15 || manifold.cell2.getAge(tick) < 15) {
            // just splited => ignore
            return false;
        }
        return !manifold.cell1.canRemerge() || !manifold.cell2.canRemerge();
    };

    // Resolves non-rigid body collision
    resolveCollision(manifold) {
        var minCell = manifold.cell1;
        var maxCell = manifold.cell2;
        // check if any cell already eaten
        if (minCell.isRemoved || maxCell.isRemoved)
            return;
        if (minCell.getSize() > maxCell.getSize()) {
            minCell = manifold.cell2;
            maxCell = manifold.cell1;
        }

        // check distance
        var eatDistance = maxCell.getSize() - minCell.getSize() / 3;
        if (manifold.squared >= eatDistance * eatDistance) {
            // too far => can't eat
            return;
        }

        if (minCell.owner && minCell.owner == maxCell.owner) {
            // collision owned/owned => ignore or resolve or remerge

            var tick = this.getTick();
            if (minCell.getAge(tick) < 15 || maxCell.getAge(tick) < 15) {
                // just splited => ignore
                return;
            }
            if (!minCell.owner.mergeOverride) {
                // not force remerge => check if can remerge
                if (!minCell.canRemerge() || !maxCell.canRemerge()) {
                    // cannot remerge
                    return;
                }
            }
        } else {
            // collision owned/enemy => check if can eat

            // Team check
            if (this.gameMode.haveTeams && minCell.owner && maxCell.owner) {
                if (minCell.owner.getTeam() == maxCell.owner.getTeam()) {
                    // cannot eat team member
                    return;
                }
            }
            // Size check
            if (maxCell.getSize() <= minCell.getSize() * 1.15) {
                // too large => can't eat
                return;
            }
        }
        if (!maxCell.canEat(minCell) || (minCell.owner && minCell.owner.protected)) {
            // maxCell don't want to eat
            return;
        }

        // Now maxCell can eat minCell
        minCell.isRemoved = true;

        // Disable mergeOverride on the last merging cell
        // We need to disable it before onCosume to prevent merging loop
        // (onConsume may cause split for big mass)
        if (minCell.owner && minCell.owner.cells.length <= 2) {
            minCell.owner.mergeOverride = false;
        }

        var isMinion = (maxCell.owner && maxCell.owner.isMinion) ||
            (minCell.owner && minCell.owner.isMinion);
        if (!isMinion) {
            // Consume effect
            maxCell.onEat(minCell);
            minCell.onEaten(maxCell);

            // update bounds
            this.updateNodeQuad(maxCell);
        }

        // Remove cell
        minCell.setKiller(maxCell);
        this.removeNode(minCell);
    };

    updateMoveEngine() {
        var tick = this.getTick();
        // Move player cells
        for (var i in this.clients) {
            var client = this.clients[i].player;
            var checkSize = !client.mergeOverride || client.cells.length == 1;
            for (var j = 0; j < client.cells.length; j++) {
                var cell1 = client.cells[j];
                if (cell1.isRemoved)
                    continue;
                cell1.updateRemerge(this);
                cell1.moveUser(this.border);
                cell1.move(this.border);

                // check size limit
                if (checkSize && cell1.getSize() > this.config.playerMaxSize && cell1.getAge(tick) >= 15) {
                    if (client.cells.length >= this.config.playerMaxCells) {
                        // cannot split => just limit
                        cell1.setSize(this.config.playerMaxSize);
                    } else {
                        // split
                        var maxSplit = this.config.playerMaxCells - client.cells.length;
                        var maxMass = this.config.playerMaxSize * this.config.playerMaxSize;
                        var count = (cell1.getSizeSquared() / maxMass) >> 0;
                        var count = Math.min(count, maxSplit);
                        var splitSize = cell1.getSize() / Math.sqrt(count + 1);
                        var splitMass = splitSize * splitSize / 100;
                        var angle = Math.random() * 2 * Math.PI;
                        var step = 2 * Math.PI / count;
                        for (var k = 0; k < count; k++) {
                            this.splitPlayerCell(client, cell1, angle, splitMass);
                            angle += step;
                        }
                    }
                }
                this.updateNodeQuad(cell1);
            }
        }
        // Move moving cells
        for (var i = 0; i < this.movingNodes.length;) {
            var cell1 = this.movingNodes[i];
            if (cell1.isRemoved)
                continue;
            cell1.move(this.border);
            this.updateNodeQuad(cell1);
            if (!cell1.isMoving)
                this.movingNodes.splice(i, 1);
            else
                i++;
        }

        // === check for collisions ===

        // Scan for player cells collisions
        var self = this;
        var rigidCollisions = [];
        var eatCollisions = [];
        for (var i in this.clients) {
            var client = this.clients[i].player;
            for (var j = 0; j < client.cells.length; j++) {
                var cell1 = client.cells[j];
                if (cell1 == null) continue;
                this.quadTree.find(cell1.quadItem.bound, function (item) {
                    var cell2 = item.cell;
                    if (cell2 == cell1) return;
                    var manifold = self.checkCellCollision(cell1, cell2);
                    if (manifold == null) return;
                    if (self.checkRigidCollision(manifold))
                        rigidCollisions.push({
                            cell1: cell1,
                            cell2: cell2
                        });
                    else
                        eatCollisions.push({
                            cell1: cell1,
                            cell2: cell2
                        });
                });
            }
        }

        // resolve rigid body collisions
        ////for (var z = 0; z < 2; z++) { // loop for better rigid body resolution quality (slow)
        for (var k = 0; k < rigidCollisions.length; k++) {
            var c = rigidCollisions[k];
            var manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveRigidCollision(manifold, this.border);
        }
        ////}
        // Update quad tree
        for (var k = 0; k < rigidCollisions.length; k++) {
            var c = rigidCollisions[k];
            this.updateNodeQuad(c.cell1);
            this.updateNodeQuad(c.cell2);
        }
        rigidCollisions = null;

        // resolve eat collisions
        for (var k = 0; k < eatCollisions.length; k++) {
            var c = eatCollisions[k];
            var manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveCollision(manifold);
        }
        eatCollisions = null;

        //this.gameMode.onCellMove(cell1, this);

        // Scan for ejected cell collisions (scan for ejected or virus only)
        rigidCollisions = [];
        eatCollisions = [];
        var self = this;
        for (var i = 0; i < this.movingNodes.length; i++) {
            var cell1 = this.movingNodes[i];
            if (cell1.isRemoved) continue;
            this.quadTree.find(cell1.quadItem.bound, function (item) {
                var cell2 = item.cell;
                if (cell2 == cell1)
                    return;
                var manifold = self.checkCellCollision(cell1, cell2);
                if (manifold == null) return;
                if (cell1.cellType == 3 && cell2.cellType == 3) {
                    // ejected/ejected
                    rigidCollisions.push({
                        cell1: cell1,
                        cell2: cell2
                    });
                    // add to moving nodes if needed
                    if (!cell1.isMoving) {
                        cell1.isMoving = true
                        self.movingNodes.push(cell1);
                    }
                    if (!cell2.isMoving) {
                        cell2.isMoving = true
                        self.movingNodes.push(cell2);
                    }
                } else {
                    eatCollisions.push({
                        cell1: cell1,
                        cell2: cell2
                    });
                }
            });
        }

        // resolve rigid body collisions
        for (var k = 0; k < rigidCollisions.length; k++) {
            var c = rigidCollisions[k];
            var manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveRigidCollision(manifold, this.border);
            // position changed! don't forgot to update quad-tree
        }
        // Update quad tree
        for (var k = 0; k < rigidCollisions.length; k++) {
            var c = rigidCollisions[k];
            this.updateNodeQuad(c.cell1);
            this.updateNodeQuad(c.cell2);
        }
        rigidCollisions = null;

        // resolve eat collisions
        for (var k = 0; k < eatCollisions.length; k++) {
            var c = eatCollisions[k];
            var manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveCollision(manifold);
        }
    };

    // Returns masses in descending order
    splitMass(mass, count) {
        // min throw size (vanilla 44)
        var throwSize = this.config.playerMinSize + 12;
        var throwMass = throwSize * throwSize / 100;

        // check maxCount
        var maxCount = count;
        var curMass = mass;
        while (maxCount > 1 && curMass / (maxCount - 1) < throwMass) {
            maxCount = maxCount / 2 >>> 0;
        }
        if (maxCount < 2) {
            return [mass];
        }

        // calculate mass
        var minMass = this.config.playerMinSize * this.config.playerMinSize / 100;
        var splitMass = curMass / maxCount;
        if (splitMass < minMass) {
            return [mass];
        }
        var masses = [];
        if (maxCount < 3 || maxCount < count || curMass / throwMass <= 30) {
            // Monotone blow up
            for (var i = 0; i < maxCount; i++) {
                masses.push(splitMass);
            }
        } else {
            // Diverse blow up
            // Barbosik: draft version
            var restCount = maxCount;
            while (restCount > 2) {
                var splitMass = curMass / 2;
                if (splitMass <= throwMass) {
                    break;
                }
                var max = curMass - throwMass * (restCount - 1);
                if (max <= throwMass || splitMass >= max) {
                    break;
                }
                masses.push(splitMass);
                curMass -= splitMass;
                restCount--;
            }
            var splitMass = curMass / 4;
            if (splitMass > throwMass) {
                while (restCount > 2) {
                    var max = curMass - throwMass * (restCount - 1);
                    if (max <= throwMass || splitMass >= max) {
                        break;
                    }
                    masses.push(splitMass);
                    curMass -= splitMass;
                    restCount--;
                }
            }
            var splitMass = curMass / 8;
            if (splitMass > throwMass) {
                while (restCount > 2) {
                    var max = curMass - throwMass * (restCount - 1);
                    if (max <= throwMass || splitMass >= max) {
                        break;
                    }
                    masses.push(splitMass);
                    curMass -= splitMass;
                    restCount--;
                }
            }
            if (restCount > 1) {
                splitMass = curMass - throwMass * (restCount - 1);
                if (splitMass > throwMass) {
                    masses.push(splitMass);
                    curMass -= splitMass;
                    restCount--;
                }
            }
            if (restCount > 0) {
                splitMass = curMass / restCount;
                if (splitMass < throwMass - 0.001) {
                    Logger.warn("Server.splitMass: throwMass-splitMass = " + (throwMass - splitMass).toFixed(3) + " (" + mass.toFixed(4) + ", " + count + ")");
                }
                while (restCount > 0) {
                    masses.push(splitMass);
                    restCount--;
                }
            }
        }
        //Logger.debug("===Server.splitMass===");
        //Logger.debug("mass = " + mass.toFixed(3) + "  |  " + Math.sqrt(mass * 100).toFixed(3));
        //var sum = 0;
        //for (var i = 0; i < masses.length; i++) {
        //    Logger.debug("mass[" + i + "] = " + masses[i].toFixed(3) + "  |  " + Math.sqrt(masses[i] * 100).toFixed(3));
        //    sum += masses[i]
        //}
        //Logger.debug("sum  = " + sum.toFixed(3) + "  |  " + Math.sqrt(sum * 100).toFixed(3));
        return masses;
    };

    splitCells(client) {
        // it seems that vanilla uses order by cell age
        var cellToSplit = [];
        for (var i = 0; i < client.cells.length; i++) {
            var cell = client.cells[i];
            if (cell.getSize() < this.config.playerMinSplitSize) {
                continue;
            }
            cellToSplit.push(cell);
            if (cellToSplit.length + client.cells.length >= this.config.playerMaxCells)
                break;
        }
        var splitCells = 0; // How many cells have been split
        for (var i = 0; i < cellToSplit.length; i++) {
            var cell = cellToSplit[i];
            var dx = ~~(client.mouse.x - cell.position.x);
            var dy = ~~(client.mouse.y - cell.position.y);
            var dl = dx * dx + dy * dy;
            if (dl < 1) {
                dx = 1;
                dy = 0;
            }
            var angle = Math.atan2(dx, dy);
            if (isNaN(angle)) angle = Math.PI / 2;

            if (this.splitPlayerCell(client, cell, angle, null)) {
                splitCells++;
            }
        }
    };

    // TODO: replace mass with size (Virus)
    splitPlayerCell(client, parent, angle, mass, boost) {
        // Returns boolean whether a cell has been split or not. You can use this in the future.

        if (client.cells.length >= this.config.playerMaxCells) {
            // Player cell limit
            return false;
        }

        var size1 = 0;
        var size2 = 0;
        if (mass == null) {
            size1 = parent.getSplitSize();
            size2 = size1;
        } else {
            size2 = Math.sqrt(mass * 100);
            size1 = Math.sqrt(parent.getSize() * parent.getSize() - size2 * size2);
        }
        if (isNaN(size1) || size1 < this.config.playerMinSize) {
            return false;
        }

        // Remove mass from parent cell first
        parent.setSize(size1);

        // make a small shift to the cell position to prevent extrusion in wrong direction
        var pos = {
            x: parent.position.x + 40 * Math.sin(angle),
            y: parent.position.y + 40 * Math.cos(angle)
        };

        // Create cell
        var newCell = new Entity.PlayerCell(this, client, pos, size2);
        newCell.setBoost(boost || newCell.boostValue, angle);

        // Add to node list
        this.addNode(newCell);
        return true;
    };

    canEjectMass(client) {
        var tick = this.getTick();
        if (client.lastEject == null) {
            // first eject
            client.lastEject = tick;
            return true;
        }
        var dt = tick - client.lastEject;
        if (dt < this.config.ejectCooldown) {
            // reject (cooldown)
            return false;
        }
        client.lastEject = tick;
        return true;
    };

    ejectMass(client) {
        if (!this.canEjectMass(client))
            return;
        for (var i = 0; i < client.cells.length; i++) {
            var cell = client.cells[i];

            if (!cell) {
                continue;
            }

            if (cell.getSize() < this.config.playerMinSplitSize) {
                continue;
            }
            var size2 = this.config.ejectSize;
            var sizeLoss = this.config.ejectSizeLoss;
            var sizeSquared = cell.getSizeSquared() - sizeLoss * sizeLoss;
            if (sizeSquared < this.config.playerMinSize * this.config.playerMinSize) {
                continue;
            }
            var size1 = Math.sqrt(sizeSquared);

            var dx = client.mouse.x - cell.position.x;
            var dy = client.mouse.y - cell.position.y;
            var dl = dx * dx + dy * dy;
            if (dl < 1) {
                dx = 1;
                dy = 0;
            } else {
                dl = Math.sqrt(dl);
                dx /= dl;
                dy /= dl;
            }

            // Remove mass from parent cell first
            cell.setSize(size1);

            // Get starting position
            var pos = {
                x: cell.position.x + dx * cell.getSize(),
                y: cell.position.y + dy * cell.getSize()
            };

            var angle = Math.atan2(dx, dy);
            if (isNaN(angle)) angle = Math.PI / 2;

            // Randomize angle
            angle += (Math.random() * 0.6) - 0.3;

            // Create cell
            var ejected = new Entity.EjectedMass(this, null, pos, size2);
            ejected.ejector = cell;
            ejected.setColor(cell.getColor());
            ejected.setBoost(this.config.ejectDistance, angle);

            this.addNode(ejected);
        }
    };

    shootVirus(parent, angle) {
        var parentPos = {
            x: parent.position.x,
            y: parent.position.y,
        };

        var newVirus = new Entity.Virus(this, null, parentPos, this.config.virusMinSize);
        newVirus.setBoost(780, angle);

        // Add to moving cells list
        this.addNode(newVirus);
    };

    getNearestVirus(cell) {
        // Loop through all viruses on the map. There is probably a more efficient way of doing this but whatever
        for (var i = 0; i < this.nodesVirus.length; i++) {
            var check = this.nodesVirus[i];
            if (check === null) continue;
            if (this.checkCellCollision(cell, check) != null) {
                return check;
            }
        }
    };

    updateMassDecay() {
        if (!this.config.playerDecayRate) {
            return;
        }
        var decay = 1 - this.config.playerDecayRate * this.gameMode.decayMod;
        // Loop through all player cells
        for (var i = 0; i < this.clients.length; i++) {
            var player = this.clients[i].player;
            for (var j = 0; j < player.cells.length; j++) {
                var cell = player.cells[j];
                var size = cell.getSize();
                if (size <= this.config.playerMinSize)
                    continue;

                var size;
                //Adjust decay for every cell in BattleRoyal
                if (this.gameMode.ID == 8 && cell.inRedArea) {
                    size = Math.sqrt(size * size * (1 - this.gameMode.redAreaDecayRate));
                    if (size < this.config.playerMinSize) {
                        this.removeNode(cell);
                    }
                } else {
                    size = Math.sqrt(size * size * decay);
                }
                size = Math.max(size, this.config.playerMinSize);
                if (size != cell.getSize()) {
                    cell.setSize(size);
                }
            }
        }
    };

    getPlayerById(id) {
        if (id == null) return null;
        for (var i = 0; i < this.clients.length; i++) {
            var player = this.clients[i].player;
            if (player.pID == id) {
                return player;
            }
        }
        return null;
    };

    checkSkinName(skinName) {
        if (!skinName) {
            return true;
        }
        if (skinName.length == 1 || skinName.length > 25) {
            return false;
        }
        if (skinName[0] != '%' /* && skinName[0] != ':' */ ) {
            return false;
        }
        for (var i = 1; i < skinName.length; i++) {
            var c = skinName.charCodeAt(i);
            if (c < 0x21 || c > 0x7F || c == '/' || c == '\\' || c == ':' || c == '%' || c == '?' || c == '&' || c == '<' || c == '>') {
                return false;
            }
        }
        return true;
    };

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
                //Logger.info(this.badWords.length + " bad words loaded");
            }
        } catch (err) {
            Logger.error(err.stack);
            Logger.error("Failed to load " + fileNameBadWords + ": " + err.message);
        }
    };

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
    };

    changeConfig(name, value) {
        if (value == null || isNaN(value)) {
            Logger.warn("Invalid value: " + value);
            return;
        }
        if (!this.config.hasOwnProperty(name)) {
            Logger.warn("Unknown config value: " + name);
            return;
        }
        this.config[name] = value;

        // update/validate
        this.config.playerMinSize = Math.max(32, this.config.playerMinSize);
        Logger.setVerbosity(this.config.logVerbosity);
        Logger.setFileVerbosity(this.config.logFileVerbosity);

        Logger.print("Set " + name + " = " + this.config[name]);
    };

    loadUserList() {
        try {
            this.userList = [];
            if (!fs.existsSync(fileNameUsers)) {
                Logger.warn(fileNameUsers + " is missing.");
                return;
            }
            var usersJson = fs.readFileSync(fileNameUsers, 'utf-8');
            var list = JSON.parse(usersJson.trim());
            for (var i = 0; i < list.length;) {
                var item = list[i];
                if (!item.hasOwnProperty("ip") ||
                    !item.hasOwnProperty("password") ||
                    !item.hasOwnProperty("role") ||
                    !item.hasOwnProperty("name")) {
                    list.splice(i, 1);
                    continue;
                }
                if (!item.password || !item.password.trim()) {
                    Logger.warn("User account \"" + item.name + "\" disabled");
                    list.splice(i, 1);
                    continue;
                }
                if (item.ip) {
                    item.ip = item.ip.trim();
                }
                item.password = item.password.trim();
                if (!UserRoleEnum.hasOwnProperty(item.role)) {
                    Logger.warn("Unknown user role: " + role);
                    item.role = UserRoleEnum.USER;
                } else {
                    item.role = UserRoleEnum[item.role];
                }
                item.name = (item.name || "").trim();
                i++;
            }
            this.userList = list;
            //Logger.info(this.userList.length + " user records loaded.");
        } catch (err) {
            Logger.error(err.stack);
            Logger.error("Failed to load " + fileNameUsers + ": " + err.message);
        }
    }

    userLogin(ip, password) {
        if (!password) return null;
        password = password.trim();
        if (!password) return null;
        for (var i = 0; i < this.userList.length; i++) {
            var user = this.userList[i];
            if (user.password != password)
                continue;
            if (user.ip && user.ip != ip && user.ip != "*") // * - means any IP
                continue;
            return user;
        }
        return null;
    };

    loadIpBanList() {
        try {
            if (fs.existsSync(fileNameIpBan)) {
                // Load and input the contents of the ipbanlist file
                this.ipBanList = fs.readFileSync(fileNameIpBan, "utf8").split(/[\r\n]+/).filter(function (x) {
                    return x != ''; // filter empty lines
                });
                if (this.ipBanList.length !== 0) Logger.info(this.ipBanList.length + " IP ban records loaded.");
            } else {
                Logger.warn(fileNameIpBan + " is missing.");
            }
        } catch (err) {
            Logger.error(err.stack);
            Logger.error("Failed to load " + fileNameIpBan + ": " + err.message);
        }
    };

    // Do not store ips in the file because we can ban clients for too many bad connections
    saveIpBanList() {
        //return;
        try {
            var blFile = fs.createWriteStream(fileNameIpBan);
            // Sort the blacklist and write.
            this.ipBanList.sort().forEach(function (v) {
                blFile.write(v + '\n');
            });
            blFile.end();
            Logger.info(this.ipBanList.length + " IP ban records saved.");
        } catch (err) {
            Logger.error(err.stack);
            Logger.error("Failed to save " + fileNameIpBan + ": " + err.message);
        }
    };

    checkIpBan(ipAddress) {
        if (!this.ipBanList || this.ipBanList.length == 0 || !ipAddress || ipAddress == "127.0.0.1") {
            return false;
        }
        if (this.ipBanList.indexOf(ipAddress) >= 0) {
            return true;
        }
        var ipBin = ipAddress.split('.');
        if (ipBin.length != 4) {
            // unknown IP format
            return false;
        }
        var subNet2 = ipBin[0] + "." + ipBin[1] + ".*.*";
        if (this.ipBanList.indexOf(subNet2) >= 0) {
            return true;
        }
        var subNet1 = ipBin[0] + "." + ipBin[1] + "." + ipBin[2] + ".*";
        if (this.ipBanList.indexOf(subNet1) >= 0) {
            return true;
        }
        return false;
    };

    banIp(ip) {
        var ipBin = ip.split('.');
        if (ipBin.length != 4) {
            Logger.warn("Invalid IP format: " + ip);
            return;
        }
        if (ipBin[0] == "127") {
            Logger.warn("Cannot ban localhost");
            return;
        }
        if (this.ipBanList.indexOf(ip) >= 0) {
            Logger.warn(ip + " is already in the ban list!");
            return;
        }
        this.ipBanList.push(ip);
        if (ipBin[2] == "*" || ipBin[3] == "*") {
            Logger.print("The IP sub-net " + ip + " has been banned");
        } else {
            Logger.print("The IP " + ip + " has been banned");
        }
        this.clients.forEach(function (socket) {
            // If already disconnected or the ip does not match
            if (socket == null || !socket.isConnected || !this.checkIpBan(socket.remoteAddress))
                return;

            // remove player cells
            socket.player.cells.forEach(function (cell) {
                this.removeNode(cell);
            }, this);

            // disconnect
            socket.close(1000, "Banned from server");
            var name = socket.player.getFriendlyName();
            Logger.print("Banned: \"" + name + "\" with Player ID " + socket.player.pID);
            this.sendChatMessage(null, null, "Banned \"" + name + "\""); // notify to don't confuse with server bug
        }, this);
        this.saveIpBanList();
    };

    unbanIp(ip) {
        var index = this.ipBanList.indexOf(ip);
        if (index < 0) {
            Logger.warn("IP " + ip + " is not in the ban list!");
            return;
        }
        this.ipBanList.splice(index, 1);
        Logger.print("Unbanned IP: " + ip);
        this.saveIpBanList();
    };

    // Kick player by ID. Use ID = 0 to kick all players
    kickId(id, moderator) {
        var count = 0;
        this.clients.forEach(function (socket) {
            if (socket.isConnected == false)
                return;
            if (id != 0 && socket.player.pID != id)
                return;
            // remove player cells
            socket.player.cells.forEach(function (cell) {
                this.removeNode(cell);
            }, this);

            var name = socket.player.getFriendlyName();
            var whoKick = moderator ? moderator : null;
            Logger.print("Kicked \"" + name + "\"");
            this.sendChatMessage(whoKick, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            // disconnect
            socket.close(1000, "Kicked from server");
            count++;
        }, this);
        if (count > 0)
            return;
        if (id == 0)
            Logger.warn("No players to kick!");
        else
            Logger.warn("Player with ID " + id + " not found!");
    };

    // Stats server
    startStatsServer(port) {
        // Do not start the server if the port is negative
        if (port < 1) {
            return;
        }

        // Create stats
        this.stats = "Test";
        this.getStats();

        Logger.info("STATS port: \x1b[34m" + port + '\x1b[0m');
        // Show stats
        var getStatsBind = this.getStats.bind(this);
        this.httpServer = http.createServer(function (req, res) {
            // Stats server
            var url = req.url.replace('/', '');
            console.log(url)
            if (url == '') {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(200);
                res.end('Welcome to API');
                return
            }
            if (url == 'stats') {
                this.statsInterval = setInterval(getStatsBind, this.config.serverStatsUpdate * 1000);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(200);
                res.end(this.stats);
                return
            }
            var urlSPLIT = url.split('');
            var accURL = urlSPLIT[0] + urlSPLIT[1] + urlSPLIT[2] + urlSPLIT[3] + urlSPLIT[4] + urlSPLIT[5] + urlSPLIT[6] + urlSPLIT[7] + urlSPLIT[8] + urlSPLIT[9] + urlSPLIT[10]
            console.log(url.replace(accURL, ''))
            //var acc = require('underscore').find(fs.readFileSync('database/data.json'), ["id",url.replace(accURL,'')])
            fs.readFileSync('./database/data.json', 'utf8', function (data) {
                console.log('here')
                var filtr = Object.values(JSON.parse(data).data).filter(account => account.id === url.replace(accURL, ''));
                console.log(filtr.length)
                res.write(filtr || 'Not Found');
                res.end()
            })

        }.bind(this));
        this.httpServer.on('error', function (err) {
            Logger.error("Stats Server: " + err.message);
        });
        this.httpServer.listen(port)
    };

    getStats() {
        // Get server statistics
        var totalPlayers = 0;
        var alivePlayers = 0;
        var spectatePlayers = 0;
        for (var i = 0; i < this.clients.length; i++) {
            var socket = this.clients[i];
            if (socket == null || !socket.isConnected)
                continue;
            totalPlayers++;
            if (socket.player.cells.length > 0)
                alivePlayers++;
            else
                spectatePlayers++;
        }
        var s = {
            'server_name': this.config.serverName,
            'server_chat': this.config.serverChat ? "true" : "false",
            'border_width': this.border.width,
            'border_height': this.border.height,
            'gamemode': this.gameMode.name,
            'max_players': this.config.serverMaxConnections,
            'current_players': totalPlayers,
            'alive': alivePlayers,
            'spectators': spectatePlayers,
            'update_time': this.updateTimeAvg.toFixed(3),
            'uptime': Math.round((this.stepDateTime - this.startTime) / 1000 / 60),
            'start_time': this.startTime
        };
        s.ip = this.config.ip + ":" + this.config.serverPort;
        this.stats = JSON.stringify(s);
    };
}

module.exports = Server;