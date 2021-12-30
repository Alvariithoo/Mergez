const Packet = require('./packet');
const BinaryWriter = require("./packet/BinaryWriter");
const UserRoleEnum = require("./enum/UserRoleEnum");

function Player(server, socket) {
    this.server = server;
    this.socket = socket;
    this.pID = -1;

    this.clientVersion = 1; // 0 - unknown client, close this connectin
    this.sendOwner = false; //send cells owner's player id (not fb id)
    this.sendUserID = false; //send fb ids (chat, minimap)
    this.sendFriendsCoords = true; //TODO put in flag and make changeable
    this.userID = 0; //FB id
    this.deviceID = 0; // numeric hash code of device ID
    this.startingSize = server ? server.config.playerStartSize : 0;


    //meanin that client can handle pIDs in minimap. 
    //Also with this flag was migration from long to int user social ID
    this.minimapIDs = false;

    this.userRole = UserRoleEnum.GUEST;
    this.showChatSuffix = false;
    this.userAuth = null;
    this.isRemoved = false;
    this.isCloseRequested = false;
    this._name = "";
    this._skin = "";
    this._nameUtf8 = null;
    this._nameUnicode = null;

    this.defaultName = "Mergez.eu";

    this._skinUtf8 = null;
    this.color = { r: 0, g: 0, b: 0 };
    this.viewNodes = [];
    this.clientNodes = [];
    this.cells = [];
    this.mergeOverride = false; // Triggered by console command
    this._score = 0; // Needed for leaderboard
    this._scale = 1;
    this._scaleF = 1;
    this.isMassChanged = true;
    this.borderCounter = 0;
    this.respawnLeftTime = 0; //player can't respawn instantly in some tournaments game modes

    this.mouse = {
        x: 0,
        y: 0
    };
    this.tickLeaderboard = 0;
    this.tickMinimap = 0;

    this.team = 0;
    this.spectate = false;
    this.freeRoam = false;      // Free-roam mode enables player to move in spectate mode
    this.spectateTarget = null; // Spectate target, null for largest player
    this.lastSpectateSwitchTick = 0;

    this.centerPos = {
        x: 0,
        y: 0
    };
    this.viewBox = {
        minx: 0,
        miny: 0,
        maxx: 0,
        maxy: 0,
        width: 0,
        height: 0,
        halfWidth: 0,
        halfHeight: 0
    };

    // Scramble the coordinate system for anti-raga
    this.scrambleX = 0;
    this.scrambleY = 0;
    this.scrambleId = 0;

    this.connectedTime = 0;
    this.isMinion = false;
    this.spawnCounter = 0;
    this.isMuted = false;

    // Gamemode function
    if (server) {
        this.connectedTime = server.stepDateTime;
        this.centerPos.x = server.border.centerx;
        this.centerPos.y = server.border.centery;
        // Player id
        this.pID = server.getNewPlayerID();
        // Gamemode function
        server.gameMode.onPlayerInit(this, server);
        // Only scramble if enabled in config
        this.scramble();
    }
}

module.exports = Player;

// Setters/Getters
Player.prototype.scramble = function () {
    if (!this.server.config.serverScrambleLevel) {
        this.scrambleId = 0;
        this.scrambleX = 0;
        this.scrambleY = 0;
    } else {
        this.scrambleId = (Math.random() * 0xFFFFFFFF) >>> 0;
        // avoid mouse packet limitations
        var maxx = Math.max(0, 32767 - 1000 - this.server.border.width);
        var maxy = Math.max(0, 32767 - 1000 - this.server.border.height);
        var x = maxx * Math.random();
        var y = maxy * Math.random();
        if (Math.random() >= 0.5) x = -x;
        if (Math.random() >= 0.5) y = -y;
        this.scrambleX = x;
        this.scrambleY = y;
    }
    this.borderCounter = 0;
};

Player.prototype.getFriendlyName = function () {
     var name = this.getName();
    if (!name) name = "";
    name = name.trim();
    if (name.length == 0)
        name = this.defaultName;
    return name;
};

Player.prototype.setName = function (name) {
    this._name = name;
    if (!name || name.length < 1) {
        this._nameUnicode = null;
        this._nameUtf8 = null;
        return;
    }
    var writer = new BinaryWriter()
    writer.writeStringZeroUnicode(name);
    this._nameUnicode = writer.toBuffer();
    writer = new BinaryWriter()
    writer.writeStringZeroUtf8(name);
    this._nameUtf8 = writer.toBuffer();
};

Player.prototype.getName = function () {
    return this._name;
};

Player.prototype.setSkin = function (skin) {
    this._skin = skin;
    if (!skin || skin.length < 1) {
        this._skinUtf8 = null;
        return;
    }
    var writer = new BinaryWriter()
    writer.writeStringZeroUtf8(skin);
    this._skinUtf8 = writer.toBuffer();
};

Player.prototype.getSkin = function () {
    if (this.server.gameMode.haveTeams) {
        return "";
    }
    return this._skin;
};

Player.prototype.getNameUtf8 = function () {
    return this._nameUtf8;
};

Player.prototype.getNameUnicode = function () {
    return this._nameUnicode;
};

Player.prototype.getSkinUtf8 = function () {
    return this._skinUtf8;
};

Player.prototype.getColor = function (color) {
    return this.color;
};

Player.prototype.setColor = function (color) {
    this.color.r = color.r;
    this.color.g = color.g;
    this.color.b = color.b;
};

Player.prototype.getTeam = function () {
    return this.team;
};

Player.prototype.getScore = function () {
    if (this.isMassChanged)
        this.updateMass();
    return this._score;
};

Player.prototype.getScale = function () {
    if (this.isMassChanged)
        this.updateMass();
    return this._scale;
};

Player.prototype.updateMass = function () {
    var totalSize = 0;
    var totalScore = 0;
    for (var i = 0; i < this.cells.length; i++) {
        var node = this.cells[i];
        totalSize += node.getSize();
        totalScore += node.getSizeSquared();
    }
    if (totalSize == 0) {
        //do not change scale for spectators or not in game players
        this._score = 0;
    } else {
        this._score = totalScore;
        if (totalScore > this.maxScore) {
            this.maxScore = totalScore;
        }
        this._scale = Math.pow(Math.min(64 / totalSize, 1), 0.4);
    }
    this.isMassChanged = false;
};

Player.prototype.massChanged = function () {
    this.isMassChanged = true;
};

// Functions
Player.prototype.joinGame = function (name, skin) {
    if (this.cells.length > 0) return;
    if (name == null) name = "";
    this.setName(name);
    if (skin != null)
        this.setSkin(skin);
    this.spectate = false;
    this.freeRoam = false;
    this.spectateTarget = null;

    // some old clients don't understand ClearAll message
    // so we will send update for them
    if (this.socket.client.protocol < 6) {
        this.socket.sendPacket(new Packet.UpdateNodes(this, [], [], [], this.clientNodes));
    }
    this.socket.sendPacket(new Packet.ClearAll());
    this.clientNodes = [];
    this.scramble();
    if (this.server.config.serverScrambleLevel < 2) {
        // no scramble / lightweight scramble
        this.socket.sendPacket(new Packet.SetBorder(this, this.server.border));
    }
    else if (this.server.config.serverScrambleLevel == 3) {
        // Scramble level 3 (no border)
        // Ruins most known minimaps
        var border = {
            minx: this.server.border.minx - (0x10000 + 10000000 * Math.random()),
            miny: this.server.border.miny - (0x10000 + 10000000 * Math.random()),
            maxx: this.server.border.maxx + (0x10000 + 10000000 * Math.random()),
            maxy: this.server.border.maxy + (0x10000 + 10000000 * Math.random())
        };
        this.socket.sendPacket(new Packet.SetBorder(this, border));
    }
    this.spawnCounter++;

    this.server.gameMode.onPlayerSpawn(this.server, this);
};

Player.prototype.checkConnection = function () {
    // Handle disconnection
    if (!this.socket.isConnected) {
        // wait for playerDisconnectTime
        var dt = (this.server.stepDateTime - this.socket.closeTime) / 1000;
        if (this.cells.length == 0 || dt >= this.server.config.playerDisconnectTime) {
            // Remove all client cells
            var cells = this.cells;
            this.cells = [];
            for (var i = 0; i < cells.length; i++) {
                this.server.removeNode(cells[i]);
            }
            // Mark to remove
            this.isRemoved = true;
            return;
        }
        this.mouse.x = this.centerPos.x;
        this.mouse.y = this.centerPos.y;
        this.socket.client.Split = false;
        this.socket.client.pressW = false;
        this.socket.client.pressQ = false;
        return;
    }
    // Check timeout
    if (!this.isCloseRequested && this.server.config.serverTimeout) {
        var dt = (this.server.stepDateTime - this.socket.lastAliveTime) / 1000;
        if (dt >= this.server.config.serverTimeout) {
            this.socket.close(1000, "Connection timeout");
            this.isCloseRequested = true;
        }
    }
};

Player.prototype.updateTick = function () {
    this.socket.client.process();
    if (this.spectate) {
        if (this.freeRoam || this.getSpectateTarget() == null) {
            // free roam
            this.updateCenterFreeRoam();
            this._scale = this.server.config.serverSpectatorScale;//0.25;
        } else {
            // spectate target
            return;
        }
    } else {
        // in game
        this.updateCenterInGame();
    }
    this.updateViewBox();
    this.updateVisibleNodes();
};

Player.prototype.sendUpdate = function () {
    if (this.isRemoved ||
        !this.socket.client.protocol ||
        !this.socket.isConnected ||
        (this.socket._socket.writable != null && !this.socket._socket.writable) ||
        this.socket.readyState != this.socket.OPEN) {
        // do not send update for disconnected clients
        // also do not send if initialization is not complete yet
        return;
    }

    if (this.spectate) {
        if (!this.freeRoam) {
            // spectate target
            var player = this.getSpectateTarget();
            if (player != null) {
                this.setCenterPos(player.centerPos.x, player.centerPos.y);
                this._scale = player.getScale();
                this.viewBox = player.viewBox;
                this.viewNodes = player.viewNodes;
            }
        }
        this.sendCameraPacket();
    }

    if (this.server.config.serverScrambleLevel == 2) {
        // scramble (moving border)
        if (this.borderCounter == 0) {
            var bound = {
                minx: Math.max(this.server.border.minx, this.viewBox.minx - this.viewBox.halfWidth),
                miny: Math.max(this.server.border.miny, this.viewBox.miny - this.viewBox.halfHeight),
                maxx: Math.min(this.server.border.maxx, this.viewBox.maxx + this.viewBox.halfWidth),
                maxy: Math.min(this.server.border.maxy, this.viewBox.maxy + this.viewBox.halfHeight)
            };
            this.socket.sendPacket(new Packet.SetBorder(this, bound));
        }
        this.borderCounter++;
        if (this.borderCounter >= 20)
            this.borderCounter = 0;
    }

    var delNodes = [];
    var eatNodes = [];
    var addNodes = [];
    var updNodes = [];
    var oldIndex = 0;
    var newIndex = 0;
    for (; newIndex < this.viewNodes.length && oldIndex < this.clientNodes.length;) {
        if (this.viewNodes[newIndex].nodeId < this.clientNodes[oldIndex].nodeId) {
            addNodes.push(this.viewNodes[newIndex]);
            newIndex++;
            continue;
        }
        if (this.viewNodes[newIndex].nodeId > this.clientNodes[oldIndex].nodeId) {
            var node = this.clientNodes[oldIndex];
            if (node.isRemoved && node.getKiller() != null && node.owner != node.getKiller().owner)
                eatNodes.push(node);
            else
                delNodes.push(node);
            oldIndex++;
            continue;
        }
        var node = this.viewNodes[newIndex];
        // skip food & eject if no moving
        if (node.isMoving || (node.cellType != 1 && node.cellType != 3))
            updNodes.push(node);
        newIndex++;
        oldIndex++;
    }
    for (; newIndex < this.viewNodes.length;) {
        addNodes.push(this.viewNodes[newIndex]);
        newIndex++;
    }
    for (; oldIndex < this.clientNodes.length;) {
        var node = this.clientNodes[oldIndex];
        if (node.isRemoved && node.getKiller() != null && node.owner != node.getKiller().owner)
            eatNodes.push(node);
        else
            delNodes.push(node);
        oldIndex++;
    }
    this.clientNodes = this.viewNodes;

    // Send packet
    this.socket.sendPacket(new Packet.UpdateNodes(
        this,
        addNodes,
        updNodes,
        eatNodes,
        delNodes));

    // Update leaderboard
    if (++this.tickLeaderboard > 25) {
        // 1 / 0.040 = 25 (once per second)
        this.tickLeaderboard = 0;
        if (this.server.leaderboardType >= 0) {
            var packet = new Packet.UpdateLeaderboard(this, this.server.leaderboard, this.server.leaderboardType);
            this.socket.sendPacket(packet);
        }
    }
    // Update minimap
    if (this.sendFriendsCoords) {
        if (++this.tickMinimap > 50) {
            //50 (once per two second)
            this.tickMinimap = 0;
            var packet = new Packet.UpdateMinimap(this, this.server.clients);
            this.socket.sendPacket(packet);
        }
    }
};

// Viewing box
Player.prototype.updateCenterInGame = function () { // Get center of cells
    var len = this.cells.length;
    if (len <= 0) return;
    var cx = 0;
    var cy = 0;
    var count = 0;
    for (var i = 0; i < len; i++) {
        var node = this.cells[i];
        cx += node.position.x;
        cy += node.position.y;
        count++;
    }
    if (count == 0) return;
    cx /= count;
    cy /= count;
    cx = (this.centerPos.x + cx) / 2;
    cy = (this.centerPos.y + cy) / 2;
    this.setCenterPos(cx, cy);
};

Player.prototype.updateCenterFreeRoam = function () {
    var dx = this.mouse.x - this.centerPos.x;
    var dy = this.mouse.y - this.centerPos.y;
    var squared = dx * dx + dy * dy;
    if (squared < 1) return;     // stop threshold

    // distance
    var d = Math.sqrt(squared);

    var invd = 1 / d;
    var nx = dx * invd;
    var ny = dy * invd;

    var speed = Math.min(d, 32);
    if (speed <= 0) return;

    var x = this.centerPos.x + nx * speed;
    var y = this.centerPos.y + ny * speed;
    this.setCenterPos(x, y);
};

Player.prototype.updateViewBox = function () {
    var scale = this.getScale();
    scale = Math.max(scale, this.server.config.serverMinScale);
    this._scaleF += 0.1 * (scale - this._scaleF);
    if (isNaN(this._scaleF))
        this._scaleF = 1;
    var width = (this.server.config.serverViewBaseX + 100) / this._scaleF;
    var height = (this.server.config.serverViewBaseY + 100) / this._scaleF;
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    this.viewBox = {
        minx: this.centerPos.x - halfWidth,
        miny: this.centerPos.y - halfHeight,
        maxx: this.centerPos.x + halfWidth,
        maxy: this.centerPos.y + halfHeight,
        width: width,
        height: height,
        halfWidth: halfWidth,
        halfHeight: halfHeight
    };
};

Player.prototype.pressQ = function () {
    if (this.spectate) {
        // Check for spam first (to prevent too many add/del updates)
        var tick = this.server.getTick();
        if (tick - this.lastSpectateSwitchTick < 40)
            return;
        this.lastSpectateSwitchTick = tick;

        //if (this.spectateTarget == null) {
        this.freeRoam = !this.freeRoam;
        //}
        //this.spectateTarget = null;
    }
};

Player.prototype.pressW = function () {
    if (this.spectate) {
        return;
    }
    else if (this.server.run) {
        this.server.ejectMass(this);
    }
};

// Im best codder of History - Alvariithoo
Player.prototype.Split = function (splitAmount = 1) {
    if (this.spectate || !this.server.run) return;  // Check dead
    const self = this;
    (function split(i) {
        const splitDelay = self.server.config.playerSplitDelay;
        setTimeout(() => {
            self.server.splitCells(self);        
            --i && split(i);
        }, splitDelay);
    })(splitAmount)
}

// old shit code and name pressSpace
// Player.prototype.Split = function () {
//     if (this.spectate) {
//         // Check for spam first (to prevent too many add/del updates)
//         var tick = this.server.getTick();
//         if (tick - this.lastSpectateSwitchTick < 40)
//             return;
//         this.lastSpectateSwitchTick = tick;

//         // Space doesn't work for freeRoam mode
//         if (this.freeRoam || this.server.largestClient == null)
//             return;
//         this.nextSpectateTarget();
//     } else if (this.server.run) {
//         if (this.mergeOverride)
//             return;
//         this.server.splitCells(this);
//     }
// };

Player.prototype.nextSpectateTarget = function () {
    if (this.spectateTarget == null) {
        this.spectateTarget = this.server.largestClient;
        return;
    }
    // lookup for next spectate target
    var index = this.server.clients.indexOf(this.spectateTarget.socket);
    if (index < 0) {
        this.spectateTarget = this.server.largestClient;
        return;
    }
    // find next
    for (var i = index + 1; i < this.server.clients.length; i++) {
        var player = this.server.clients[i].player;
        if (player.cells.length > 0) {
            this.spectateTarget = player;
            return;
        }
    }
    for (var i = 0; i <= index; i++) {
        var player = this.server.clients[i].player;
        if (player.cells.length > 0) {
            this.spectateTarget = player;
            return;
        }
    }
    // no alive players
    this.spectateTarget = null;
};

Player.prototype.getSpectateTarget = function () {
    if (this.spectateTarget == null || this.spectateTarget.isRemoved || this.spectateTarget.cells.length < 1) {
        this.spectateTarget = null;
        return this.server.largestClient;
    }
    return this.spectateTarget;
};

Player.prototype.updateVisibleNodes = function () {
    this.viewNodes = [];
    if (!this.isMinion) {
        var self = this;
        this.server.quadTree.find(this.viewBox, function (quadItem) {
            if (quadItem.cell.owner != self)
                self.viewNodes.push(quadItem.cell);
        });
    }
    this.viewNodes = this.viewNodes.concat(this.cells);
    this.viewNodes.sort(function (a, b) { return a.nodeId - b.nodeId; });
};

Player.prototype.setCenterPos = function (x, y) {
    if (isNaN(x) || isNaN(y)) {
        throw new TypeError("Player.setCenterPos: NaN");
    }
    x = Math.max(x, this.server.border.minx);
    y = Math.max(y, this.server.border.miny);
    x = Math.min(x, this.server.border.maxx);
    y = Math.min(y, this.server.border.maxy);
    this.centerPos.x = x;
    this.centerPos.y = y;
};

Player.prototype.sendCameraPacket = function () {
    this.socket.sendPacket(new Packet.UpdatePosition(
        this,
        this.centerPos.x,
        this.centerPos.y,
        this.getScale()
    ));
};

Player.prototype.isValidForMiniMapPIDs = function () {
    //don't send additional data for old clients
    return (this.clientVersion >= 154 || /*iOS versions*/(this.clientVersion >= 4 && this.clientVersion < 100));
};