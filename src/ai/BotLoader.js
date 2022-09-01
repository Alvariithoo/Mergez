// Library imports
const fs = require('fs');

// Project imports
const BotPlayer = require('./BotPlayer');
const FakeSocket = require('./FakeSocket');
const Client = require('../Client');
const MinionPlayer = require('./MinionPlayer');

class BotLoader {
    constructor(server) {
        this.server = server;
        this.loodNames();
    }
    getName() {
        var name = "";
        // Picks a random name for the bot
        if (this.randomNames.length > 0) {
            var index = (this.randomNames.length * Math.random()) >>> 0;
            name = this.randomNames[index];
        } else {
            name = `bot${++this.nameIndex}`;
        }

        return name;
    }
    loodNames() {
        const botnameFile = "./ai/botnames.txt";
        this.randomNames = [];
        if (fs.existsSync(botnameFile))
            this.randomNames = fs.readFileSync(botnameFile, "utf8").split(/[\r\n]+/).filter(function (x) {
                return x != ''; // filter empty names
            });
        this.nameIndex = 0;
    }
    addBot() {
        // Create a FakeSocket instance and assign its properties.
        const socket = new FakeSocket(this.server);
        socket.player = new BotPlayer(this.server, socket);
        socket.client = new Client(this.server, socket);

        const name = this.getName();

        // Add to client list and spawn.
        this.server.clients.push(socket);
        socket.client.setNickname(name);
    }
    addMinion(owner, name, mass) {
        // Aliases
        const maxSize = this.server.config.minionMaxStartSize;
        const defaultSize = this.server.config.minionStartSize;

        const socket = new FakeSocket(this.server);
        socket.player = new MinionPlayer(this.server, socket, owner);
        socket.client = new Client(this.server, socket);
        socket.player.owner = owner;

        // Set minion spawn size
        socket.player.spawnmass = mass || maxSize > defaultSize ? Math.floor(Math.random() * (maxSize - defaultSize) + defaultSize) : defaultSize;

        // Add to client list
        this.server.clients.push(socket);

        // Add to world & set name
        socket.client.setNickname(name == "" || !name ? this.server.config.defaultName : name);
    }
}

module.exports = BotLoader;