const Cell = require('./Cell');

class PlayerCell extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);        
        this.cellType = 0;
        this._canRemerge = false;

        //default value
        this._canRemergeLimit = 100;
        this.boostValue = 870;

        var gameMode = this.server.gameMode;
        
        //ultra values
        if (gameMode.canRemergeLimit){
            this._canRemergeLimit = gameMode.canRemergeLimit;
        }

        if (gameMode.newPlayerCellBoostValue){
            this.boostValue = gameMode.newPlayerCellBoostValue;
        } 
    }

    updateRemerge() {
        var age = this.getAge(this.server.getTick());
        var mergeType = this.server.config.playerMergeType;
        var cellMass = this.getMass();

        switch(mergeType) {
            case 0: { // Ultrasplit
                var minDoubleMass = 6000;
                this._canRemerge = cellMass >= minDoubleMass / 4 ? age >= 21 : true;
                break;
            }
            case 1: { // Instant
                this._canRemerge = age >= 24;
                break;
            }
            case 2: { // Megasplit
                this._canRemerge = age >= cellMass * 2;
                break;
            }
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
        if (this.owner == null || this.owner.socket.isConnected === false) {
            return;
        }
        var x = this.owner.mouse.x;
        var y = this.owner.mouse.y;
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        var dx = ~~(x - this.position.x);
        var dy = ~~(y - this.position.y);
        var squared = dx * dx + dy * dy;
        if (squared < 1) return;
        
        // distance
        var d = Math.sqrt(squared);
        
        // normal
        var invd = 1 / d;
        var nx = dx * invd;
        var ny = dy * invd;
        
        // normalized distance (0..1)
        d = Math.min(d, 32) / 32;
        var speed = this.getSpeed() * d;
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
        var index;
        // Remove from player cell list
        index = this.owner.cells.indexOf(this);
        if (index != -1) {
            this.owner.cells.splice(index, 1);
        }
        // Gamemode actions
        server.gameMode.onCellRemove(this);
    }
}

module.exports = PlayerCell;