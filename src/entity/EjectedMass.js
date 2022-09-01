const Cell = require('./Cell');

class EjectedMass extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 3;
    }
    onAdd(server) {
        // Add to list of ejected mass
        server.nodesEjected.push(this);
    }
    onRemove(server) {
        // Remove from list of ejected mass
        var index = server.nodesEjected.indexOf(this);
        if (index != -1) {
            server.nodesEjected.splice(index, 1);
        }
    }
}

module.exports = EjectedMass;