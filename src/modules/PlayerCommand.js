var Entity = require('../entity');
var Logger = require('./Logger');
var UserRoleEnum = require("../enum/UserRoleEnum");
var Packet = require("../packet");
var CommandList = require("./CommandList");

var fillChar = function (data, char, fieldLength, rTL) {
    if (data === undefined) return
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    } else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};


function PlayerCommand(server, player) {
    this.server = server;
    this.player = player;
}

module.exports = PlayerCommand;

PlayerCommand.prototype.writeLine = function (text) {
    this.server.sendChatMessage(null, this.player, text);
};

PlayerCommand.prototype.executeCommandLine = function (commandLine) {
    if (!commandLine) return;

    if (!this.parsePluginCommands(commandLine)) return;

    // Splits the string
    var args = commandLine.split(" ");

    // Process the first string value
    var first = args[0].toLowerCase();

    // Get command function
    var execute = playerCommands[first];
    if (typeof execute != 'undefined') {
        execute.bind(this)(args);
    } else {
        this.writeLine("ERROR: Unknown command, type /help for command list");
    }
};

PlayerCommand.prototype.parsePluginCommands = function(str) {
    // Splits the string
    var args = str.split(" ");
    
    // Process the first string value
    var first = args[0].toLowerCase();
    
    // Get command function
    var execute = this.server.Plugins.playerCommands[first];
    if (typeof execute != 'undefined') {
        execute(this, args, this.player, this.server);
        return false;
    } else return true;
}

PlayerCommand.prototype.userLogin = function (ip, password) {
    if (!password) return null;
    password = password.trim();
    if (!password) return null;
    for (var i = 0; i < this.server.userList.length; i++) {
        var user = this.server.userList[i];
        if (user.password != password)
            continue;
        if (user.ip && user.ip != ip && user.ip != "*") // * - means any IP
            continue;
        return user;
    }
    return null;
};

var playerCommands = {
    help: function (args) {
        if (this.player.userRole == UserRoleEnum.MODER) {
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/killall - kills everyone.")
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("/mass - gives mass to yourself or to other player");
            this.writeLine("/minion - gives yourself or other player minions");
            this.writeLine("/minion remove - removes all of your minions or other players minions");
            // this.writeLine("/status - Shows Status of the Server");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }
        if (this.player.userRole == UserRoleEnum.ADMIN) {
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/killall - kills everyone.")
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("/mass - gives mass to yourself or to other player");
            this.writeLine("/spawnmass - gives yourself or other player spawnmass");
            this.writeLine("/minion - gives yourself or other player minions");
            this.writeLine("/minion remove - removes all of your minions or other players minions");
            this.writeLine("/addbot - Adds AI Bots to the Server");
            this.writeLine("/shutdown - SHUTDOWNS THE SERVER");
            this.writeLine("/status - Shows Status of the Server");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            /*this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");*/
        }
    },
    restart: function (server) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        this.writeLine("Restarting...");
        this.server.restart();
    },
    
    idpopo: function (args) {
        this.writeLine("Your PlayerID is " + this.player.pID);
    },
    
    skinpopo: function (args) {
        if (this.player.cells.length) {
            this.writeLine("ERROR: Cannot change skin while player in game!");
            return;
        }
        var skinName = "";
        if (args[1]) skinName = args[1];
        this.player.setSkin(skinName);
        if (skinName == "")
            this.writeLine("Your skin was removed");
        else
            this.writeLine("Your skin set to " + skinName);
    },
    playerlist: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("You don't have permission to use this command.");
            return;
        }
        this.writeLine("Showing " + this.server.clients.length + " players: ");
        var sockets = this.server.clients.slice(0);
        for (var i = 0; i < sockets.length; i++) {
            var socket = sockets[i];
            var client = socket.player;
            
            // Get ip (15 digits length)
            var ip = "[BOT]";
            if (socket.isConnected != null) {
                ip = socket.remoteAddress;
            }
            ip = fillChar(ip, ' ', 15);
            var protocol = this.server.clients[i].client.protocol;
            if (protocol == null)
                protocol = "?"
            // Get name and data
            var nick = '',
                cells = '',
                data = '';
            if (socket.closeReason != null) {
                // Disconnected
                var reason = "[DISCONNECTED] ";
                if (socket.closeReason.code)
                    reason += "[" + socket.closeReason.code + "] ";
                if (socket.closeReason.message)
                    reason += socket.closeReason.message;
                this.writeLine(`ID: ${ip} IP: ${protocol} RS: ${reason}`);
            } else if (!socket.client.protocol && socket.isConnected) {
                this.writeLine(`ID: ${ip} IP: ${protocol} [CONNECTING]`);
            } else if (client.spectate) {
                nick = "in free-roam";
                if (!client.freeRoam) {
                    var target = client.getSpectateTarget();
                    if (target != null) {
                        nick = target.getName();
                    }
                }
                data = fillChar("SPECTATING");
                this.writeLine(`ID: ${ip} IP: ${protocol} DATA: ${data}`);
            } else if (client.cells.length > 0) {
                nick = fillChar(client.getName(), ' ', this.server.config.playerMaxNickLength);
                cells = fillChar(client.cells.length, ' ', 5, true);
                this.writeLine(`NICK: ${nick} IP: ${ip} CELLS: ${cells} ID: ${protocol}`);
            } else {
                // No cells = dead player or in-menu
                data = fillChar("DEAD OR NOT PLAYING");
                this.writeLine(`ID: ${ip} IP: ${protocol} DATA: ${data}`);
            }
        }
    },
    kill: function (args) {
        if (!this.player.cells.length) {
            //this.writeLine("You cannot kill yourself, because you're still not joined to the game!");
            return;
        }
        while (this.player.cells.length) {
            var cell = this.player.cells[0];
            this.server.removeNode(cell);
            // replace with food
            /*var food = require('../entity/Food');
            food = new food(this.server, null, cell.position, cell._size);
            food.color = cell.color;
            this.server.addNode(food);*/
        }
        //this.writeLine("Respawned");
    },
    kick: function(args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var id = args[1];
        var reason = args[2]
        if(!reason) reason = ' Reason: None' 
        else reason = " Reason: "+reason
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        //kick player
        var count = 0;
        this.server.clients.forEach(function(socket) {
            if (socket.isConnected === false)
                return;
            if (id !== 0 && socket.player.pID.toString() != id && socket.player.accountusername != id)
                return;
            // remove player cells
            for (var j = 0; j < socket.player.cells.length; j++) {
                this.server.removeNode(socket.player.cells[0]);
                count++;
            }
            // disconnect
            var name = socket.player._name;
            this.server.sendChatMessage(null, null, name+' was kicked.'+reason);
            socket.close(1000, "Kicked from server");
            this.writeLine("You kicked " + name+'.'+reason)
            console.log(name+' was kicked.'+reason)
            count++;
        }, this);
        if (count) return;
        if (!id) this.writeLine("No players to kick!");
        else this.writeLine("Player with ID " + id + "not found!");
    },
    mute: function(args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var id = args[1];
        var reason = args[2]
        if(!reason) reason = ' Reason: None' 
        else reason = " Reason: "+reason
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        //kick player
        var count = 0;
        this.server.clients.forEach(function(socket) {
            // disconnect
            var name = socket.player._name;
            this.server.sendChatMessage(null, null, name+' was muted.'+reason);
            this.writeLine("You muted " + name+'.'+reason)
            console.log(name+' was muted.'+reason)
            socket.player.isMuted=true;
            count++;
        }, this);
        if (count) return;
        if (!id) this.writeLine("No players to mute!");
        else this.writeLine("Player with ID " + id + "not found!");
    },
    unmute: function(args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var id = args[1];
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        //kick player
        var count = 0;
        this.server.clients.forEach(function(socket) {
            var name = socket.player._name;
            if(socket.player.isMuted==false) {
                this.writeLine(name+" isn't muted")
            }
            this.server.sendChatMessage(null, null, name+' was unmuted.');
            this.writeLine("You unmuted " + name+'.')
            console.log(name+' was unmuted.')
            socket.player.isMuted=false;
            count++;
        }, this);
        if (count) return;
        if (!id) this.writeLine("No players to mute!");
        else this.writeLine("Player with ID " + id + "not found!");
    },
    pause: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        this.server.run = !this.server.run; // Switches the pause state
        var s = server.run ? "Unpaused" : "Paused";
        this.writeLine(s + " the game.");
    },
    freeze: function(args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var id = args[1];
        if (id == null) {
            this.writeline("Please specify a valid player ID!");
            return;
        }
        //kick player
        var count = 0;
        this.server.clients.forEach(function(socket) {
            var name = socket.player._name;
            var client = socket.player;
            if (!client.cells.length) return this.writeLine('Player is not playing!')
            if(!client.frozen){
                client.frozen=true;
                console.log(name+` is frozen now.`)
                this.server.sendChatMessage(null, null, name+' is now frozen.');
                this.writeLine("You froze " + name)
            }else{
                client.frozen=false;
                this.server.sendChatMessage(null, null, name+` isn't frozen now.`);
                this.writeLine("You unfroze " + name);
                console.log(name+` isn't frozen now.`)
            }
            count++;
        }, this);
        if (count) return;
        if (!id) this.writeLine("No players to mute!");
        else this.writeLine("Player with ID " + id + "not found!");
    },
    killall: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN && this.player.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var count = 0;
        var cell = this.player.cells[0];
        for (var i = 0; i < this.server.clients.length; i++) {
            var player = this.server.clients[i].player;
            while (player.cells.length > 0) {
                this.server.removeNode(player.cells[0]);
                count++;
            }
        }
        this.writeLine("You killed everyone. (" + count + (" cells.)"));
    },

    mass: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN && this.player.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var mass = parseInt(args[1]);
        var id = parseInt(args[2]);
        var size = Math.sqrt(mass * 100);

        if (isNaN(mass)) {
            this.writeLine("ERROR: missing mass argument!");
            return;
        }

        if (isNaN(id)) {
            this.writeLine("Warn: missing ID arguments. This will change your mass.");
            for (var i in this.player.cells) {
                this.player.cells[i].setSize(size);
            }
            this.writeLine("Set mass of " + this.player._name + " to " + size * size / 100);
        } else {
            for (var i in this.server.clients) {
                var client = this.server.clients[i].player;
                if (client.pID == id) {
                    for (var j in client.cells) {
                        client.cells[j].setSize(size);
                    }
                    this.writeLine("Set mass of " + client._name + " to " + size * size / 100);
                    var text = this.player._name + " changed your mass to " + size * size / 100;
                    this.server.sendChatMessage(null, client, text);
                    break;
                }
            }
        }

    },
    spawnmass: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var mass = parseInt(args[1]);
        var id = parseInt(args[2]);
        var size = Math.sqrt(mass * 100);

        if (isNaN(mass)) {
            this.writeLine("ERROR: missing mass argument!");
            return;
        }

        if (isNaN(id)) {
            this.player.spawnmass = size;
            this.writeLine("Warn: missing ID arguments. This will change your spawnmass.");
            this.writeLine("Set spawnmass of " + this.player._name + " to " + size * size / 100);
        } else {
            for (var i in this.server.clients) {
                var client = this.server.clients[i].player;
                if (client.pID == id) {
                    client.spawnmass = size;
                    this.writeLine("Set spawnmass of " + client._name + " to " + size * size / 100);
                    var text = this.player._name + " changed your spawn mass to " + size * size / 100;
                    this.server.sendChatMessage(null, client, text);
                }
            }
        }
    },
    minion: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN && this.player.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var add = args[1];
        var id = parseInt(args[2]);
        var player = this.player;

        /** For you **/
        if (isNaN(id)) {
            this.writeLine("Warn: missing ID arguments. This will give you minions.");
            // Remove minions
            if (player.minionControl == true && add == "remove") {
                player.minionControl = false;
                player.miQ = 0;
                this.writeLine("Succesfully removed minions for " + player._name);
                // Add minions
            } else {
                player.minionControl = true;
                // Add minions for self
                if (isNaN(parseInt(add))) add = 1;
                for (var i = 0; i < add; i++) {
                    this.server.bots.addMinion(player);
                }
                this.writeLine("Added " + add + " minions for " + player._name);
            }

        } else {
            /** For others **/
            for (var i in this.server.clients) {
                var client = this.server.clients[i].player;
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
                        this.writeLine("Succesfully removed minions for " + client._name);
                        var text = this.player._name + " removed all off your minions.";
                        this.server.sendChatMessage(null, client, text);
                        // Add minions
                    } else {
                        client.minionControl = true;
                        // Add minions for client
                        if (isNaN(add)) add = 1;
                        for (var i = 0; i < add; i++) {
                            this.server.bots.addMinion(client);
                        }
                        this.writeLine("Added " + add + " minions for " + client._name);
                        var text = this.player._name + " gave you " + add + " minions.";
                        this.server.sendChatMessage(null, client, text);
                    }
                }
            }
        }
    },
    addbot: function (args) {
        var add = parseInt(args[1]);
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        for (var i = 0; i < add; i++) {
            this.server.bots.addBot();
        }
        Logger.warn(this.player.socket.remoteAddress + "ADDED " + add + " BOTS");
        this.writeLine("Added " + add + " Bots");
    },
    status: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN && this.player.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        // Get amount of humans/bots
        var humans = 0,
            bots = 0;
        for (var i = 0; i < this.server.clients.length; i++) {
            if ('_socket' in this.server.clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        var ini = require('./ini.js');
        this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.writeLine("Connected players: " + this.server.clients.length + "/" + this.server.config.serverMaxConnections);
        this.writeLine("Players: " + humans + " - Bots: " + bots);
        this.writeLine("Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        this.writeLine("Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        this.writeLine("Current game mode: " + this.server.gameMode.name);
        this.writeLine("Current update time: " + this.server.updateTimeAvg.toFixed(3) + " [ms]  (" + ini.getLagMessage(this.server.updateTimeAvg) + ")");
        this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    },
    gett: function (args) {
        var password = args[1] + "";
        if (password.length < 1) {
            this.writeLine("ERROR: missing password argument!");
            return;
        }
        var user = this.userLogin(this.player.socket.remoteAddress, password);
        if (!user) {
            this.writeLine("ERROR: login failed!");
            return;
        }
        Logger.write("LOGIN        " + this.player.socket.remoteAddress + ":" + this.player.socket.remotePort + " as \"" + user.name + "\"");
        this.player.userRole = user.role;
        this.player.userAuth = user.name;
        this.writeLine("Login done as \"" + user.name + "\"");
        return;
    },
    logout: function (args) {
        if (this.player.userRole == UserRoleEnum.GUEST) {
            this.writeLine("ERROR: not logged in");
            return;
        }
        Logger.write("LOGOUT       " + this.player.socket.remoteAddress + ":" + this.player.socket.remotePort + " as \"" + this.player.userAuth + "\"");
        this.player.userRole = UserRoleEnum.GUEST;
        this.player.userAuth = null;
        this.writeLine("Logout done");
    },
    shutdown: function (args) {
        if (this.player.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        Logger.warn("SHUTDOWN REQUEST FROM " + this.player.socket.remoteAddress + " as " + this.player.userAuth);
        process.exit(0);
    },
};