const Cell = require('./Cell');
const Food = require('./Food');
const Virus = require('./Virus');

class MotherCell extends Virus {
    /**
     * @param {any} server
     * @param {any} owner
     * @param {{ x: number; y: number; }} position
     * @param {any} size
     */
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.onEat = Cell.prototype.onEat;
        this.cellType = 2;
        this.isSpiked = true;
        this.isMotherCell = true; // Not to confuse bots
        this.setColor({ r: 0xce, g: 0x63, b: 0x63 });
        this.motherCellMinSize = 149; // vanilla 149 (mass = 149*149/100 = 222.01)
        this.motherCellSpawnAmount = 2;
        if (!this.getSize()) {
            this.setSize(this.motherCellMinSize);
        }
    }
    /**
     * @param {{ cellType: number; }} cell
     */
    canEat(cell) {
        return [0, 2, 3].includes(cell.cellType); // can eat player cell, virus, or ejected mass
    }
    onUpdate() {
        if (this.getSize() <= this.motherCellMinSize) {
            return;
        }
        const maxFood = this.server.config.foodMaxAmount + 500;
        if (this.server.currentFood >= maxFood) {
            return;
        }
        let size1 = this.getSize();
        const size2 = this.server.config.foodMinSize;
        for (let i = 0; i < this.motherCellSpawnAmount; i++) {
            size1 = Math.max(Math.sqrt(size1 * size1 - size2 * size2), this.motherCellMinSize);
            this.setSize(size1);

            // Spawn food with size2
            const angle = Math.random() * 2 * Math.PI;
            const r = this.getSize();
            const pos = {
                x: this.position.x + r * Math.sin(angle),
                y: this.position.y + r * Math.cos(angle)
            };

            // Spawn food
            const food = new Food(this.server, null, pos, size2);
            food.setColor(this.server.getRandomColor());
            this.server.addNode(food);

            // Eject to random distance
            food.setBoost(35 + 35 * Math.random(), angle);

            if (this.server.currentFood >= maxFood || size1 <= this.motherCellMinSize) {
                break;
            }
        }
        this.server.updateNodeQuad(this);
    }
    onAdd() {}
    onRemove() {}
}

module.exports = MotherCell;