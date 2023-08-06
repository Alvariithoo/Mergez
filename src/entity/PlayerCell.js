const Cell = require('./Cell');

class PlayerCell extends Cell {
    /**
     * @param {any} server
     * @param {any} owner
     * @param {{ x: number; y: number; }} position
     * @param {number} size
     */
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.cellType = 0;
        this._canRemerge = false;

        // Default values
        this._canRemergeLimit = 100;
        this.boostValue = 870;

        const gameMode = this.server.gameMode;

        // Ultra values
        if (gameMode.canRemergeLimit) {
            this._canRemergeLimit = gameMode.canRemergeLimit;
        }

        if (gameMode.newPlayerCellBoostValue) {
            this.boostValue = gameMode.newPlayerCellBoostValue;
        }
    }
    updateRemerge() {
        const age = this.getAge(this.server.getTick());
        const mergeType = this.server.config.playerMergeType;
        const cellMass = this.getMass();

        switch (mergeType) {
            case 0: // Ultrasplit
                const minDoubleMass = 6000;
                this._canRemerge = cellMass >= minDoubleMass / 4 ? age >= 21 : true;
                break;
            case 1: // Instant
                this._canRemerge = age >= 24;
                break;
            case 2: // Megasplit
                this._canRemerge = age >= cellMass * 2;
                break;
        }
    }
    canRemerge() {
        return this._canRemerge;
    }
    canEat(cell) {
        return true;
    }
    getSplitSize() {
        const splitMultiplier = 1 / Math.sqrt(2);
        return this.getSize() * splitMultiplier;
    }
    moveUser(border) {
        if (!this.owner || !this.owner.socket.isConnected) {
            return;
        }
        const x = this.owner.mouse.x;
        const y = this.owner.mouse.y;
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        const dx = ~~(x - this.position.x);
        const dy = ~~(y - this.position.y);
        const squared = dx * dx + dy * dy;
        if (squared < 1) return;

        // distance
        const distance = Math.sqrt(squared);

        // normal
        const invd = 1 / distance;
        const nx = dx * invd;
        const ny = dy * invd;

        // normalized distance (0..1)
        const clampedDistance = Math.min(distance, 32) / 32;
        const speed = this.getSpeed() * clampedDistance;
        if (speed <= 0) return;

        this.position.x += nx * speed;
        this.position.y += ny * speed;
        this.checkBorder(border);
    }
    onAdd(server) {
        // Gamemode actions
        server.gameMode.onCellAdd(this);
    }
    onRemove(server) {
        // Remove from player cell list
        const index = this.owner.cells.indexOf(this);
        if (index !== -1) {
            this.owner.cells.splice(index, 1);
        }
        // Gamemode actions
        server.gameMode.onCellRemove(this);
    }
}

module.exports = PlayerCell;