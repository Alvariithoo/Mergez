const Cell = require('./Cell');

class Minions extends Cell {
    /**
     * @param {any} server
     * @param {any} owner
     * @param {{ x: number; y: number; }} position
     * @param {number} size
     */
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 2;
        this.isSpiked = true;
        this.isMotherCell = false; // Not to confuse bots
        this.setColor({ r: 0xff, g: 0x00, b: 0x94 });
        this.setSize(150);
        this.powertimer = 20 * 1000 // 20 Seconds
        this.power = 2;
        this.server = server;
    }
    onEaten(server) {
        const player = server.owner;
        const self = this;
        if (this.power == 2) {
            player.minionControl = true;
            for (let i = 0; i < 5; i++) {
                this.server.bots.addMinion(player);
            }
            this.server.sendChatMessage(null, player, "you got 5 minions for 20 sec!");
            setTimeout(function() {
                player.minionControl = false;
                player.miQ = 0;
                self.server.sendChatMessage(null, player, "your minions have expired");
            }, this.powertimer);
        }
    }
    onAdd(server) {
        server.nodesVirus.push(this);
    }
    onRemove(server) {
        const index = server.nodesVirus.indexOf(this);
        if (index != -1) {
            server.nodesVirus.splice(index, 1);
        }
    }
}

module.exports = Minions;