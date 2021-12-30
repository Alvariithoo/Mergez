const WebSocket = require("ws");
const pjson = require('../package.json');
const Packet = require('./packet');
const BinaryReader = require('./packet/BinaryReader');
const Logger = require('./modules/Logger');
const day = require('./modules/date');
const UserRoleEnum = require('./enum/UserRoleEnum');

class Client {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.protocol = 0;
        this.handshakeProtocol = null;
        this.handshakeKey = null;
        this.lastJoinTick = 0;
        this.lastChatTick = 0;
        this.lastStatTick = 0;
        this.lastWTick = 0;
        this.lastQTick = 0;
        this.lastSpaceTick = 0;

        this.userRole = UserRoleEnum.GUEST;
        this.pressQ = false;
        this.pressW = false;
        this.Split = false;
        this.mouseData = null;

        this.handler = {
            254: this.handshake_onProtocol.bind(this),
        };
    }

    handleMessage(message) {
        if (!this.handler.hasOwnProperty(message[0])) {
            return;
        }
        this.handler[message[0]](message);
        this.socket.lastAliveTime = this.server.stepDateTime;
    };

    handshake_onProtocol(message) {
        if (message.length !== 5) return;
        this.handshakeProtocol = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
        if (this.handshakeProtocol < 1 || this.handshakeProtocol > 9) {
            this.socket.close(1002, "Not supported protocol");
            return;
        }
        this.handler = {
            255: this.handshake_onKey.bind(this),
        };
    };

    handshake_onKey(message) {
        if (message.length !== 5) return;
        this.handshakeKey = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
        if (this.handshakeProtocol > 6 && this.handshakeKey !== 0) {
            this.socket.close(1002, "Not supported protocol");
            return;
        }
        this.handshake_onCompleted(this.handshakeProtocol, this.handshakeKey);
    };

    handshake_onCompleted(protocol, key) {
        this.handler = {
            0: this.message_onJoin.bind(this),
            1: this.message_onSpectate.bind(this),
            // 2: this.message_getOwnersID.bind(this),
            // 3: this.message_getUsersID.bind(this),
            5: this.message_setParams.bind(this),
            16: this.message_onMouse.bind(this),
            17: this.onSplit.bind(this),
            18: this.onDoubleSplit.bind(this),
            19: this.onTripleSplit.bind(this),
            20: this.onSixteenSplit.bind(this),
            21: this.message_onKeyQ.bind(this),
            // 18: this.message_onKeyQ.bind(this),
            //19: AFK
            22: this.message_onKeyW.bind(this),
            99: this.message_onChat.bind(this),
            101: this.message_onAbility.bind(this),
            254: this.message_onStat.bind(this),
        };
        this.protocol = protocol;
        // Send handshake response
        this.sendPacket(new Packet.ClearAll());
        this.sendPacket(new Packet.SetBorder(this.socket.player, this.server.border, this.server.config.serverGamemode, "MultiOgarMaster " + pjson.version));
        this.sendPacket(new Packet.SetParams(this.server));
        // Send welcome message
        //this.server.sendChatMessage(null, this.socket.player, "MultiOgarMaster " + pjson.version);
        if (this.server.config.serverWelcome1)
            this.server.sendChatMessage(null, this.socket.player, this.server.config.serverWelcome1);
        if (this.server.config.serverWelcome2)
            this.server.sendChatMessage(null, this.socket.player, this.server.config.serverWelcome2);
        if (this.server.config.serverChat == 0)
            this.server.sendChatMessage(null, this.socket.player, "This server's chat is disabled.");
        if (this.protocol < 4)
            this.server.sendChatMessage(null, this.socket.player, "WARNING: Protocol " + this.protocol + " assumed as 4!");
    };

    message_onJoin(message) {
        var tick = this.server.getTick();
        var dt = tick - this.lastJoinTick;
        this.lastJoinTick = tick;
        if (dt < 25 || this.socket.player.cells.length !== 0) {
            return;
        }
        var reader = new BinaryReader(message);
        reader.skipBytes(1);
        var text = null;
        if (this.protocol < 6)
            text = reader.readStringZeroUnicode();
        else
            text = reader.readStringZeroUtf8();
        this.setNickname(text);
    };

    message_onAbility(message) {
        var reader = new BinaryReader(message);
        reader.skipBytes(1);
        let id = reader.readUInt8();
        this.server.useAbility(id, this.socket.player);
    };

    message_onSpectate(message) {
        if (message.length !== 1 || this.socket.player.cells.length !== 0) {
            return;
        }
        this.socket.player.spectate = true;
    };

    // message_getOwnersID(message) {
    //     if (message.length !== 1) {
    //         return;
    //     }
    //     this.socket.player.sendOwner = true;
    // };

    // message_getUsersID(message) {
    //     if (message.length !== 9) {
    //         return;
    //     }

    //     var reader = new BinaryReader(message);
    //     reader.skipBytes(1);

    //     this.socket.player.sendUserID = true;
    //     this.socket.player.userID = reader.readDouble();

    //     console.log("message_getUsersID: " + this.socket.player.userID);
    // };

    message_setParams(message) {
        var player = this.socket.player;
        var reader = new BinaryReader(message);
        reader.skipBytes(1);

        var joined = true;
        if (player.clientVersion != 0) {
            joined = false;
        }

        player.clientVersion = reader.readInt32();
        var flags = reader.readUInt32();

        if ((flags & 1) != 0) {
            player.sendOwner = true;
        }
        if ((flags & 2) != 0) {
            player.showChatSuffix = true;
        }
        if ((flags & 4) != 0) {
            player.sendCellType = true;
        }

        var fbID = reader.readDouble();
        player.userID = !isNaN(fbID) ? fbID : 0;
        if (player.userID != 0) {
            player.sendUserID = true; // fb id in chat, minimap
        }

        var startingMass = reader.readUInt32();
        player.startingSize = parseInt(Math.sqrt(startingMass * 100));

        try {
            var roleId = reader.readUInt8();
            player.userRole = roleId;
            player.deviceID = reader.readInt32();
        } catch (e) { };

        player.minimapIDs = player.isValidForMiniMapPIDs(); // whether send player ID in UpdateMinimap packet

        var logStr = (joined ? "Joined " : "SetParams ") + player.userID + " sm: " + startingMass + " cl_ver: " + player.clientVersion;
        Logger.info(logStr)
    };

    message_onMouse(message) {
        if (message.length !== 13 && message.length !== 9 && message.length !== 21) {
            return;
        }
        this.mouseData = Buffer.concat([message]);
    };

    onSplit() {
        this.socket.player.Split();
    };

    onDoubleSplit() {
        this.socket.player.Split(2);
    };

    onTripleSplit() {
        this.socket.player.Split(3);
    };

    onSixteenSplit() {
        this.socket.player.Split(4);
    };
    
    message_onKeyQ(message) {
        if (message.length !== 1) return;
        var tick = this.server.getTick();
        var dt = tick - this.lastQTick;
        if (dt < this.server.config.ejectCooldown) {
            return;
        }
        this.lastQTick = tick;
        this.pressQ = true;
    };

    message_onKeyW(message) {
        if (message.length !== 1) return;
        var tick = this.server.getTick();
        var dt = tick - this.lastWTick;
        if (dt < this.server.config.ejectCooldown) {
            return;
        }
        this.lastWTick = tick;
        this.pressW = true;
    };

    message_onChat(message, player, text) {
        if (message.length < 3) return;
        var tick = this.server.getTick();
        var dt = tick - this.lastChatTick;
        this.lastChatTick = tick;
        if (dt < 25 * 2) {
            return;
        }
        console.log("[" + day() + "] | " + "[CHAT] | [" + message + "]");
        var flags = message[1];    // flags
        var rvLength = (flags & 2 ? 4 : 0) + (flags & 4 ? 8 : 0) + (flags & 8 ? 16 : 0);
        if (message.length < 3 + rvLength) // second validation
            return;

        var reader = new BinaryReader(message);
        reader.skipBytes(2 + rvLength);     // reserved
        var text = null;
        if (this.protocol < 6)
            text = reader.readStringZeroUnicode();
        else
            text = reader.readStringZeroUtf8();
        this.server.onChatMessage(this.socket.player, null, text);
    };

    message_onStat(message) {
        if (message.length !== 1) return;
        var tick = this.server.getTick();
        var dt = tick - this.lastStatTick;
        this.lastStatTick = tick;
        if (dt < 25) {
            return;
        }
        this.socket.sendPacket(new Packet.ServerStat(this.socket.player));
    };

    processMouse() {
        if (this.mouseData == null) return;
        var client = this.socket.player;
        var reader = new BinaryReader(this.mouseData);
        reader.skipBytes(1);
        if (this.mouseData.length === 13) {
            // protocol late 5, 6, 7
            client.mouse.x = reader.readInt32() - client.scrambleX;
            client.mouse.y = reader.readInt32() - client.scrambleY;
        } else if (this.mouseData.length === 9) {
            // early protocol 5
            client.mouse.x = reader.readInt16() - client.scrambleX;
            client.mouse.y = reader.readInt16() - client.scrambleY;
        } else if (this.mouseData.length === 21) {
            // protocol 4
            var x = reader.readDouble() - client.scrambleX;
            var y = reader.readDouble() - client.scrambleY;
            if (!isNaN(x) && !isNaN(y)) {
                client.mouse.x = x;
                client.mouse.y = y;
            }
        }
        this.mouseData = null;
    };

    process() {
        /*if (this.Split) { // Split cell
            this.socket.player.Split();
            this.Split = false;
        }*/
        if (this.pressW) { // Eject mass
            this.socket.player.pressW();
            this.pressW = false;
        }
        if (this.pressQ) { // Q Press
            this.socket.player.pressQ();
            this.pressQ = false;
        }
        this.processMouse();
    };

    setNickname(text) {
        var name = "";
        var skin = null;
        if (text != null && text.length > 0) {
            var skinName = null;
            var userName = text;
            var n = -1;
            if (text[0] == '<' && (n = text.indexOf('>', 1)) >= 1) {
                if (n > 1)
                    skinName = "%" + text.slice(1, n);
                else
                    skinName = "";
                userName = text.slice(n + 1);
            }
            else if (text[0] == "|" && (n = text.indexOf('|', 1)) >= 0) {
                skinName = ":https://i.imgur.com/" + text.slice(1, n) + ".png";
                userName = text.slice(n + 1);
            }
            if (skinName && !this.server.checkSkinName(skinName)) {
                skinName = null;
                userName = text;
            }
            skin = skinName;
            name = userName;
        }
        /* //mover from here to another place due to %dev%mass% prefix
        if (name.length > this.server.config.playerMaxNickLength) {
            name = name.substring(0, this.server.config.playerMaxNickLength);
        }
        */

        if (name.trim().toLowerCase() == "dev" && +this.socket.player.userID > 10) {
            name = "fake dev";
        }

        if (this.server.checkBadWord(name)) {
            skin = null;
            name = "";
        }
        this.socket.player.joinGame(name, skin);
    };

    sendPacket(packet) {
        var socket = this.socket;
        if (!packet || !socket.isConnected || socket.player.isMi || socket.player.isBot) return;
        if (socket.readyState == WebSocket.OPEN) {
            var buffer = packet.build(this.protocol);
            if (buffer) socket.send(buffer, { binary: true });
        }
    };
}

module.exports = Client;