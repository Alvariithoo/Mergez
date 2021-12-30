var Cell = require('./Cell');

function EjectedMass() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 3;
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

// Main Functions

EjectedMass.prototype.onAdd = function (server) {
    // Add to list of ejected mass
    server.nodesEjected.push(this);
};

EjectedMass.prototype.onRemove = function (server) {
    // Remove from list of ejected mass
    var index = server.nodesEjected.indexOf(this);
    if (index != -1) {
        server.nodesEjected.splice(index, 1);
    }
};
