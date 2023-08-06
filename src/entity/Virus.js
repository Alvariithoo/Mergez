const Cell = require('./Cell');
const Logger = require('../modules/Logger');

class Virus extends Cell {
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
        this.fed = 0;
        this.isMotherCell = false; // Not to confuse bots
        this.setColor({ r: 0x33, g: 0xff, b: 0x33 });
    }
    
    canEat(cell) {
        return cell.cellType === 3; // Virus can eat ejected mass only
    }

    onEat(prey) {
        // Called when a virus eats a prey cell
        this.setSize(Math.sqrt(this.getSizeSquared() + prey.getSizeSquared()));

        const virusMaxSize = this.server.config.virusMaxSize;
        if (this.getSize() >= virusMaxSize) {
            this.setSize(this.server.config.virusMinSize); // Reset mass
            this.server.shootVirus(this, prey.getAngle());
        }
    }

    onEaten(consumer) {
        const client = consumer.owner;
        if (!client) return;

        const maxSplit = this.server.config.playerMaxCells - client.cells.length;
        const masses = this.server.splitMass(consumer.getMass(), maxSplit + 1);

        if (masses.length < 2) return;

        const massesMix = [];
        for (let i = 1; i < masses.length; i += 2) massesMix.push(masses[i]);
        for (let i = 2; i < masses.length; i += 2) massesMix.push(masses[i]);
        const balancedMasses = massesMix;

        const angleStep = (2 * Math.PI) / balancedMasses.length;
        let angle = 2 * Math.PI * Math.random();
        for (const mass of balancedMasses) {
            if (!this.server.splitPlayerCell(client, consumer, angle, mass)) break;
            angle = (angle + angleStep) % (2 * Math.PI);
        }
    }

    onAdd(server) {
        server.nodesVirus.push(this);
    }

    onRemove(server) {
        const index = server.nodesVirus.indexOf(this);
        if (index !== -1) {
            server.nodesVirus.splice(index, 1);
        } else {
            Logger.error("Virus.onRemove: Tried to remove a non-existing virus!");
        }
    }
}

module.exports = Virus;