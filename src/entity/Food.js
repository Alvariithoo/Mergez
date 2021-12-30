var Cell = require('./Cell');

function Food() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 1;
}

module.exports = Food;
Food.prototype = new Cell();

// Main Functions

Food.prototype.onAdd = function (server) {
    server.currentFood++;
};

Food.prototype.onRemove = function (server) {
    server.currentFood--;
};
