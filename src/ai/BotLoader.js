// Project imports
const fs = require("fs");
const Logger = require('../modules/Logger');
const BotPlayer = require('./BotPlayer');
const FakeSocket = require('./FakeSocket');
const Client = require('../Client');

class BotLoader {
    constructor(server) {
        this.server = server;
        this.loadNames();
    }

    getName() {
        var name = "";
        
        // Picks a random name for the bot
        if (this.randomNames.length > 0) {
            var index = (this.randomNames.length * Math.random()) >>> 0;
            name = this.randomNames[index];
        } else {
            name = "bot" + ++this.nameIndex;
        }
        
        return name;
    };

    loadNames() {
        this.randomNames = [];
        
        if (fs.existsSync("../src/ai/BotNames.txt")) {
            // Read and parse the names - filter out whitespace-only names
            this.randomNames = fs.readFileSync("../src/ai/BotNames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
                return x != ''; // filter empty names
            });
        }
        this.nameIndex = 0;
    };

    addBot() {
        var s = new FakeSocket(this.server);
        s.player = new BotPlayer(this.server, s);
        s.client = new Client(this.server, s);
        
        // Add to client list
        this.server.clients.push(s);
        
        // Add to world
        s.client.setNickname(this.getName());
    };

    addMinion(owner, name) {
        var MinionPlayer = require('./MinionPlayer');
        var s = new FakeSocket(this.server);
        s.player = new MinionPlayer(this.server, s, owner);
        s.client = new Client(this.server, s);
        s.player.owner = owner;

        // Spawn minions at special size
        var size = 100;
        if (200 > size)
            size = Math.random() * (this.server.config.minionMaxStartSize - size) + size;
        s.player.spawnmass = 666;
        
        // Add to client list
        this.server.clients.push(s);

        // Add to world & set name
        if (typeof name == "undefined" || name == "") {
            name = name;
        }
        s.client.setNickname(name);
    };
}

module.exports = BotLoader;