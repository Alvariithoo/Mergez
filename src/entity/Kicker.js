const Cell = require('./Cell');

class Kicker extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 2;
        this.isSpiked = true;
        this.isMotherCell = false; // Not to confuse bots
        this.setColor({ r: 0xff, g: 0x00, b: 0x94 });
        this.setSize(150);
        this.powertimer = 20 * 1000 // 20 Seconds
        this.server = server;
    }
    onAdd(server) {
        server.nodesVirus.push(this);
    }
    onRemove(server) {
        var index = server.nodesVirus.indexOf(this);
        if (index != -1) {
            server.nodesVirus.splice(index, 1);
        }
    }
}

module.exports = Kicker;