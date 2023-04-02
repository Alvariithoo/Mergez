const Entity = require('../entity');
const Logger = require('./Logger');
const UserRoleEnum = require('../enum/UserRoleEnum');

class Command {
    constructor(name, usage, description, minimumCredential, handler) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.minCred = minimumCredential;
        this.handler = handler;
    }
}

const send = (player, msg) => player.server.sendChatMessage(null, player, msg);
const findPlayer = (server, id) => {
    const c = server.clients.find(c => c.player.pID == id);
    return c && c.player;
};

let commandMap = new Map();

const commands = [
    new Command("help", "[cmd]", "lists available commands, or command usage", UserRoleEnum.GUEST, (player, args) => {
        let cmd = args[1];
        if (cmd && (cmd = commandMap.get(cmd)))
            return send(player, `usage: /${cmd.name} ${cmd.usage}`);
        send(player, "~".repeat(70));
        for (const cmd of commands)
            if (player.userRole >= cmd.minCred)
                send(player, `/${cmd.name} - ${cmd.description}.`)
        send(player, "~".repeat(70));
    }),
    new Command("id", "", "gets your playerID", UserRoleEnum.GUEST, (player, args) => {
        send(player, `Your PlayerID is ${player.pID}`);
    }),
    new Command("kill", "", "self kill", UserRoleEnum.GUEST, (player, args) => {
        if (!player.cells.length) {
            // send(player, "You cannot kill yourself, because you're still not joined to the game!");
            return;
        }
        while (player.cells.length) {
            const cell = player.cells[0];
            player.server.removeNode(cell);
        }
    }),
    new Command("gett", "<password>", "upgrade your credential to access more commands", UserRoleEnum.GUEST, (player, args) => {
        let pass = args[1];
        if (!pass || !(pass = pass.trim()))
            return send(player, "ERROR: missing password argument!");
        let user = player.server.userList.find(c => c.password == pass && (c.ip == player.socket.remoteAddress || c.ip == "*"));
        if (!user) return send(player, "ERROR: login failed!");

        Logger.write(`LOGIN ${player.socket.remoteAddress}:${player.socket.remotePort} as "${user.name}"`);
        player.userRole = user.role;
        player.userAuth = user.name;
        send(player, `Login done as "${user.name}"`);
    }),
    new Command("logout", "", "remove your credentials", UserRoleEnum.GUEST, (player, args) => {
        Logger.write("LOGOUT       " + player.socket.remoteAddress + ":" + player.socket.remotePort + " as \"" + player.userAuth + "\"");
        player.userRole = UserRoleEnum.GUEST;
        player.userAuth = null;
        send(player, "Logout done");
    }),
    new Command("tp", "[id] <cords-x> <cords-y>", "teleport a(n) (player's)", UserRoleEnum.MODER, (player, args) => {
        let id = parseInt(args[1]);
        if (isNaN(id)) return send(player, "Please specify a valid player ID!");

        // Make sure the input values are numbers
        let pos = {
            x: parseInt(args[2]),
            y: parseInt(args[3])
        }
        if (isNaN(pos.x) || isNaN(pos.y)) return send(player, "Invalid coordinates");

        // Spawn
        for (let i in player.server.clients) {
            if (player.server.clients[i].player.pID == id) {
                var client = player.server.clients[i].player;
                if (!client.cells.length) return send(player, "That player is either dead or not playing!");
                for (let j in client.cells) {
                    client.cells[j].position.x = pos.x;
                    client.cells[j].position.y = pos.y;
                    player.server.updateNodeQuad(client.cells[j]);
                }
                // send(player, `Teleported ${client._name} to (${pos.x} , ${pos.y} + ")`);
                break;
            }
        }
        if (client == null) return void send(player, "That player ID is non-existant!");
    }),
    new Command("mass", "<mass> [id]", "gives mass to yourself or to other player", UserRoleEnum.MODER, (player, args) => {
        const mass = parseInt(args[1]);
        if (isNaN(mass)) return send(player, "ERROR: missing mass argument!");
        const size = Math.sqrt(mass * 100);
        const id = parseInt(args[2]);

        let p;
        if (isNaN(id)) {
            send(player, "Warn: missing ID argument. This will change your mass.");
            p = player;
        } else p = findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        for (const cell of p.cells) cell.setSize(size);
        send(player, `Set mass of ${player._name} to ${mass}`);
        if (p != player) send(p, player._name + " changed your mass to " + mass);
    }),
    new Command("spawn", "[<virus>|<food>|<mothercell>|<minion>|<kicker>] <cords-x> <cords-y> <mass>", "spawn a entity", UserRoleEnum.MODER, (player, arg) => {
        let ent = arg[1];
        if (ent != "virus" && ent != "food" && ent != "mothercell" && ent != "minion" && ent != "kicker") {
            send(player, "Please specify either virus, food, minion, or mothercell");
            return;
        }

        let pos = {
            x: parseInt(arg[2]),
            y: parseInt(arg[3])
        }

        let mass = parseInt(arg[4]);
        if (!isNaN(mass)) size = Math.sqrt(mass * 100);

        // Make sure the input values are numbers
        if (isNaN(pos.x) || isNaN(pos.y)) return send(player, "Invalid coordinates");

        // Start size for each entity 
        let size;
        if (ent == "virus") {
            size = player.server.config.virusMinSize;
        } else if (ent == "mothercell") {
            size = player.server.config.virusMinSize * 2.5;
        } else if (ent == "food") {
            size = player.server.config.foodMinMass;
        } else if (ent == "minion") {
            size = player.server.config.virusMinSize;
        } else if (ent == "kicker") {
            size = 50;
        }

        // Spawn for each entity
        if (ent == "virus") {
            let virus = new Entity.Virus(player.server, null, pos, size);
            player.server.addNode(virus);
            Logger.print(`Spawned 1 virus at (${pos.x} , ${pos.y})`);
        } else if (ent == "food") {
            let food = new Entity.Food(player.server, null, pos, size);
            food.color = player.server.getRandomColor();
            player.server.addNode(food);
            Logger.print(`Spawned 1 food cell at (${pos.x} , ${pos.y})`);
        } else if (ent == "mothercell") {
            let mother = new Entity.MotherCell(player.server, null, pos, size);
            player.server.addNode(mother);
            Logger.print(`Spawned 1 mothercell at (${pos.x} , ${pos.y})`);
        } else if (ent == "minion") {
            let mother = new Entity.Minions(player.server, null, pos, size);
            player.server.addNode(mother);
            Logger.print(`Spawned 1 minion at (${pos.x} , ${pos.y})`);
        } else if (ent == "kicker") {
            let kicker = new Entity.Kicker(player.server, null, pos, size);
            Logger.print(`Spawned 1 kicker at (${pos.x} , ${pos.y})`);
            player.server.addNode(kicker);
        }
    }),
    /*new Command("skin", "[skin]", "change skin", UserRoleEnum.MODER, (player, args) => {
        if (player.cells.length) {
            send(player, "ERROR: Cannot change skin while player in game!");
            return;
        }
        let skinName = "";
        if (args[1]) skinName = args[1];
        player.setSkin(skinName);
        if (skinName == "")
            send(player, "Your skin was removed");
        else
            send(player, "Your skin set to " + skinName);
    }),*/
    new Command("playerlist", "", "get list of players, bots, ID's, etc", UserRoleEnum.MODER, (player, args) => {
        send(player, "Showing " + player.server.clients.length + " players: ");
        let sockets = player.server.clients.slice(0);
        for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];
            const client = socket.player;

            var nick = '';
            var cells = '';
            var data = '';
            var ip = "[BOT]";
            var id = (client.pID);

            if (socket.isConnected != null) {
                ip = socket.remoteAddress;
            }
            
            const protocol = player.server.clients[i].client.protocol;
            if (protocol == null)
                protocol = "?"
            // Get name and data
            
            if (socket.closeReason != null) {
                // Disconnected
                const reason = "[DISCONNECTED] ";
                if (socket.closeReason.code)
                    reason += "[" + socket.closeReason.code + "] ";
                if (socket.closeReason.message)
                    reason += socket.closeReason.message;
                send(player, `ID: ${id}, REASON: ${reason}`);
            } else if (!socket.client.protocol && socket.isConnected) {
                send(player, `ID: ${id}, [CONNECTING]`);
            } else if (client.spectate) {
                nick = "in free-roam";
                if (!client.freeRoam) {
                    const target = client.getSpectateTarget();
                    if (target != null) {
                        nick = target._name;
                    }
                }
                data = "SPECTATING";
                send(player, `ID: ${id}, DATA: ${data}`);
            } else if (client.cells.length > 0) {
                nick = client._name;
                cells = client.cells.length;
                send(player, `ID: ${id}, NICK: ${nick}, CELLS: ${cells} `);
            } else {
                // No cells = dead player or in-menu
                send(player, `ID: ${id}, DEAD OR NOT PLAYING`);
            }
        }
    }),
    new Command("kick", "[id] <reason>", "Kick player or bot", UserRoleEnum.MODER, (player, args) => {
        let id = args[1];
        let reason = args[2];
        if (!reason) reason = " Reason: None";
        else reason = " Reason: " + reason;
        if (id == null) {
            send(player, "Please specify a valid player ID!");
            return;
        }
        //kick player
        var count = 0;
        player.server.clients.forEach(function (socket) {
            if (socket.isConnected === false)
                return;
            if (id !== 0 && socket.player.pID.toString() != id && socket.player.accountusername != id)
                return;
            // remove player cells
            for (let j = 0; j < socket.player.cells.length; j++) {
                player.server.removeNode(socket.player.cells[0]);
                count++;
            }
            // disconnect
            const name = socket.player._name.split("$")[0];
            player.server.sendChatMessage(null, null, name + " was kicked." + reason);
            socket.close(1000, "Kicked from server");
            send(player, "You kicked " + name + "." + reason)
            console.log(name + " was kicked." + reason)
            count++;
        }, this);
        if (count) return;
        if (!id) send(player, "No players to kick!");
        else send(player, "Player with ID " + id + "not found!");
    }),
    new Command("killall", "", "kills everyone", UserRoleEnum.MODER, (player, args) => {
        const count = 0;
        for (let i = 0; i < player.server.clients.length; i++) {
            const player = player.server.clients[i].player;
            while (player.cells.length > 0) {
                player.server.removeNode(player.cells[0]);
                count++;
            }
        }
        send(player, "You killed everyone. (" + count + (" cells.)"));
    }),
    new Command("spawnmass", "<mass> [id]", "gives spawn with mass to yourself or to other player", UserRoleEnum.MODER, (player, args) => {
        const mass = parseInt(args[1]);
        if (isNaN(mass))
            return send(player, "ERROR: missing mass argument!");
        const size = Math.sqrt(mass * 100);
        const id = parseInt(args[2]);

        let p;
        if (isNaN(id)) {
            send(player, "Warn: missing ID argument. This will change your spawnmass.");
            p = player;
        } else p = findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        p.spawnmass = size; // it's called spawnmass, not spawnsize, but ok.
        send(player, `Set spawnmass of ${p._name} to ` + mass);
        if (p != player) send(p, player._name + " changed your spawn mass to " + mass);
    }),
    new Command("minion", "[id] <count>", "gives yourself or other player minions", UserRoleEnum.MODER, (player, args) => {
        let add = args[1];
        let id = parseInt(args[2]);
        const p = player;

        /** For you **/
        if (isNaN(id)) {
            send(player, "Warn: missing ID arguments. This will give you minions.");
            // Remove minions
            if (p.minionControl == true && add == "remove") {
                p.minionControl = false;
                p.miQ = 0;
                send(player, "Succesfully removed minions for " + p._name);
                // Add minions
            } else {
                p.minionControl = true;
                // Add minions for self
                if (isNaN(parseInt(add))) add = 1;
                for (let i = 0; i < add; i++) {
                    player.server.bots.addMinion(player);
                }
                send(player, "Added " + add + " minions for " + p._name);
            }
        } else {
            /** For others **/
            for (let i in player.server.clients) {
                const client = player.server.clients[i].player;
                if (client.pID == id) {

                    // Prevent the user from giving minions, to minions
                    if (client.isMi) {
                        Logger.warn("You cannot give minions to a minion!");
                        return;
                    };

                    // Remove minions
                    if (client.minionControl == true) {
                        client.minionControl = false;
                        client.miQ = 0;
                        send(player, "Succesfully removed minions for " + client._name);
                        const text = player._name + " removed all off your minions.";
                        player.server.sendChatMessage(null, client, text);
                        // Add minions
                    } else {
                        client.minionControl = true;
                        // Add minions for client
                        if (isNaN(add)) add = 1;
                        for (let i = 0; i < add; i++) {
                            player.server.bots.addMinion(client);
                        }
                        send(player, "Added " + add + " minions for " + client._name);
                        const text = player._name + " gave you " + add + " minions.";
                        player.server.sendChatMessage(null, client, text);
                    }
                }
            }
        }
    }),
    new Command("addbot", "<count>", "adds AI bots to the server", UserRoleEnum.MODER, (player, args) => {
        const add = parseInt(args[1]);
        for (let i = 0; i < add; i++) {
            player.server.bots.addBot();
        }
        Logger.warn(player.socket.remoteAddress + "ADDED " + add + " BOTS");
        send(player, "Added " + add + " Bots");
    }),
    new Command("ban", "[id]", "bans a(n) (player's)", UserRoleEnum.ADMIN, (player, args) => {
        // Error message
        const logInvalid = "Please specify a valid player ID or IP address!";

        if (args[1] == null) {
            // If no input is given; added to avoid error
            send(player, logInvalid);
            return;
        }

        if (args[1].indexOf(".") >= 0) {
            // If input is an IP address
            let ip = args[1];
            let ipParts = ip.split(".");

            // Check for invalid decimal numbers of the IP address
            for (let i in ipParts) {
                if (i > 1 && ipParts[i] == "*") {
                    // mask for sub-net
                    continue;
                }
                // If not numerical or if it's not between 0 and 255
                // TODO: Catch string "e" as it means "10^".
                if (isNaN(ipParts[i]) || ipParts[i] < 0 || ipParts[i] >= 256) {
                    send(player, logInvalid);
                    return;
                }
            }

            if (ipParts.length != 4) {
                // an IP without 3 decimals
                send(player, logInvalid);
                return;
            }

            player.server.banIp(ip);
            return;
        }
        // if input is a Player ID
        let id = parseInt(args[1]);
        if (isNaN(id)) {
            // If not numerical
            send(player, logInvalid);
            return;
        }

        let ip = null;
        for (let i in player.server.clients) {
            const client = player.server.clients[i];
            if (client == null || !client.isConnected)
                continue;
            if (client.player.pID == id) {
                ip = client._socket.remoteAddress;
                break;
            }
        }
        if (ip) player.server.banIp(ip);
        else send(player, "Player ID " + id + " not found!");
    }),
    new Command("mute", "[id] <reason>", "mute (player's) from chat", UserRoleEnum.ADMIN, (player, args) => {
        let id = args[1];
        let reason = args[2];
        if (!reason) reason = " Reason: None";
        else reason = " Reason: " + reason;
        if (id == null) {
            send(player, "Please specify a valid player ID!");
            return;
        }
        const count = 0;
        player.server.clients.forEach(function (socket) {
            // disconnect
            const name = socket.player._name.split("$")[0];
            player.server.sendChatMessage(null, null, name + " was muted." + reason);
            send(player, "You muted " + name + "." + reason);
            console.log(name + " was muted." + reason);
            socket.player.isMuted = true;
            count++;
        }, this);
        if (count) return;
        if (!id) send(player, "No players to mute!");
        else send(player, "Player with ID " + id + "not found!");
    }),
    new Command("unmute", "[id]", "unmute (player's) from chat", UserRoleEnum.ADMIN, (args) => {
        let id = args[1];
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        const count = 0;
        player.server.clients.forEach(function (socket) {
            const name = socket.player._name.split("$")[0];
            if (socket.player.isMuted == false) {
                send(player, name + " isn't muted")
            }
            player.server.sendChatMessage(null, null, name + ' was unmuted.');
            send(player, "You unmuted " + name + '.')
            console.log(name + ' was unmuted.')
            socket.player.isMuted = false;
            count++;
        }, this);
        if (count) return;
        if (!id) send(player, "No players to mute!");
        else send(player, "Player with ID " + id + "not found!");
    }),
    new Command("pause", "", "freeze game", UserRoleEnum.ADMIN, (player, args) => {
        player.server.run = !player.server.run; // Switches the pause state
        let s = server.run ? "Unpaused" : "Paused";
        send(player, s + " the game.");
    }),
    new Command("freeze", "[id]", "frozen (player's) or bots", UserRoleEnum.ADMIN, (player, args) => {
        let id = args[1];
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        //kick player
        const count = 0;
        player.server.clients.forEach(function (socket) {
            const name = socket.player._name;
            const client = socket.player;
            if (!client.cells.length) return send(player, 'Player is not playing!')
            if (!client.frozen) {
                client.frozen = true;
                console.log(name + ` is frozen now.`)
                player.server.sendChatMessage(null, null, name + ' is now frozen.');
                send(player, "You froze " + name)
            } else {
                client.frozen = false;
                player.server.sendChatMessage(null, null, name + ` isn't frozen now.`);
                send(player, "You unfroze " + name);
                console.log(name + ` isn't frozen now.`)
            }
            count++;
        }, this);
        if (count) return;
        if (!id) send(player, "No players to mute!");
        else send(player, "Player with ID " + id + "not found!");
    }),
    new Command("status", "", "show status of the Server", UserRoleEnum.ADMIN, (player, args) => {
        // Get amount of humans/bots
        let humans = 0,
            bots = 0;
        for (let i = 0; i < player.server.clients.length; i++) {
            if ('_socket' in player.server.clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        const ini = require('./ini.js');
        send(player, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        send(player, "Connected players: " + player.server.clients.length + "/" + player.server.config.serverMaxConnections);
        send(player, "Players: " + humans + " - Bots: " + bots);
        send(player, "Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        send(player, "Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        send(player, "Current game mode: " + player.server.gameMode.name);
        send(player, "Current update time: " + player.server.updateTimeAvg.toFixed(3) + " [ms]  (" + ini.getLagMessage(player.server.updateTimeAvg) + ")");
        send(player, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }),
    new Command("restart", "", "restarts the server", UserRoleEnum.ADMIN, (player, server) => {
        send(player, "Restarting...");
        player.server.restart();
    }),
    new Command("shutdown", "", "SHUTS DOWN THE SERVER", UserRoleEnum.ADMIN, (args) => {
        Logger.warn("SHUTDOWN REQUEST FROM " + player.socket.remoteAddress + " as " + player.userAuth);
        process.exit(0);
    }),
]

for (const cmd of commands) commandMap.set(cmd.name, cmd);

class PlayerCommand {
    constructor(server, player) {
        this.server = server;
        this.player = player;
    }
    processMessage(from, msg) {
        msg = msg.slice(1); // remove forward-slash
        let args = msg.split(" ");
        const cmdName = args[0];
        const cmd = commandMap.get(cmdName);
        if (cmd)
            if (from.userRole >= cmd.minCred) cmd.handler(from, args);
            else send(from, "ERROR: access denied! " + from.userRole + ", " + cmd.minCred);
        else send(from, "Invalid command, please use /help to get a list of available commands");
    }
}

module.exports = PlayerCommand;