const Cell = require('./Cell');

class Food extends Cell {
    /**
     * @param {any} server
     * @param {null} owner
     * @param {{ x: number; y: number; }} position
     * @param {number} size
     */
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 1;
    }
    onAdd(server) {
        server.currentFood++;
    }
    onRemove(server) {
        server.currentFood--;
    }
}

module.exports = Food;