var Cell = require('./Cell');
var PlayerCell = require('./PlayerCell');

function Minions(server) {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    this.cellType = 2;
    this.isSpiked = true;
    this.isMotherCell = false; // Not to confuse bots
    this.setColor({ r: 0xff, g: 0x00, b: 0x94 });
    this.setSize(150);
    this.powertimer = 20 * 1000 // 20 Seconds
    this.power = 2;
    this.server = server;
}
module.exports = Minions;
Minions.prototype = new Cell();

// Main Functions

Minions.prototype.onEaten = function (c) {
    var player = c.owner;
    var self = this;
    if (this.power == 2) {
        player.minionControl = true;
        for (var i = 0; i < 5; i++) {
            this.server.bots.addMinion(player);
        }
        this.server.sendChatMessage(null, player, "you got 5 minions for 20 sec!");
        setTimeout(function() {
            player.minionControl = false;
            player.miQ = 0;
            // self.server.sendChatMessage(null, player, "your minions have expired");
        }, this.powertimer);
    }
};

Minions.prototype.onAdd = function (server) {
    server.nodesVirus.push(this);
};

Minions.prototype.onRemove = function (server) {
    var index = server.nodesVirus.indexOf(this);
    if (index != -1) {
        server.nodesVirus.splice(index, 1);
    }
};
