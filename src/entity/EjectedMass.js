const Cell = require('./Cell');

class EjectedMass extends Cell {
    /**
     * @param {any} server
     * @param {any} owner
     * @param {{ x: number; y: number; }} position
     * @param {number} size
     */
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
        const index = server.nodesEjected.indexOf(this);
        if (index != -1) {
            server.nodesEjected.splice(index, 1);
        }
    }
}

module.exports = EjectedMass;