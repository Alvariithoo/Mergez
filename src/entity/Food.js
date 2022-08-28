const Cell = require('./Cell');

class Food extends Cell {
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