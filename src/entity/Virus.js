const Cell = require('./Cell');
const Logger = require('../modules/Logger');

class Virus extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 2;
        this.isSpiked = true;
        this.fed = 0;
        this.isMotherCell = false; // Not to confuse bots
        this.setColor({ r: 0x33, g: 0xff, b: 0x33 });
    }

    canEat(cell) {
        return cell.cellType == 3; // virus can eat ejected mass only
    }

    onEat(prey) {
        // Called to eat prey cell
        this.setSize(Math.sqrt(this.getSizeSquared() + prey.getSizeSquared()));
        
        if (this.getSize() >= this.server.config.virusMaxSize) {
            this.setSize(this.server.config.virusMinSize); // Reset mass
            this.server.shootVirus(this, prey.getAngle());
        }
    }

    onEaten(consumer) {
        var client = consumer.owner;
        if (client == null) return;
        
        var maxSplit = this.server.config.playerMaxCells - consumer.owner.cells.length;
        var masses = this.server.splitMass(consumer.getMass(), maxSplit + 1);
        if (masses.length < 2) {
            return;
        }
        
        // Balance mass around center & skip first mass (==consumer mass)
        var massesMix = [];
        for (var i = 1; i < masses.length; i += 2)
            massesMix.push(masses[i]);
        for (var i = 2; i < masses.length; i += 2)
            massesMix.push(masses[i]);
        masses = massesMix;
        
        // Blow up the cell...
        var angle = 2 * Math.PI * Math.random();
        var step = 2 * Math.PI / masses.length;
        for (var i = 0; i < masses.length; i++) {
            if (!this.server.splitPlayerCell(client, consumer, angle, masses[i])) {
                break;
            }
            angle += step;
            if (angle >= 2 * Math.PI) {
                angle -= 2 * Math.PI;
            }
        }
    }

    onAdd(server) {
        server.nodesVirus.push(this);
    }

    onRemove(server) {
        var index = server.nodesVirus.indexOf(this);
        if (index != -1) {
            server.nodesVirus.splice(index, 1);
        } else {
            Logger.error("Virus.onRemove: Tried to remove a non existing virus!");
        }
    }
}

module.exports = Virus;