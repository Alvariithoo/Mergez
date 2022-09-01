const Player = require('../Player');

class MinionPlayer extends Player {
    constructor(server, socket, owner) {
        super(server, socket);
        this.owner = owner
        this.isMi = true; // Marks as minion
        this.socket.isConnected = true;
    }
    checkConnection() {
        if (this.socket.isCloseRequest) {
            while (this.cells.length) {
                this.server.removeNode(this.cells[0]);
            }
            this.isRemoved = true;
            return;
        }
        if (this.owner.cells.length) {
            this.joinGame(this.owner._name, this.owner._skin, true)
            if (!this.cells.length) this.socket.close();
        }
        // remove if owner has disconnected or has no control
        if (this.owner.socket.isConnected == false || !this.owner.minionControl)
            this.socket.close();

        // frozen or not
        if (this.owner.minionFrozen) this.frozen = true;
        else this.frozen = false;

        // split cells
        if (this.owner.minionSplit)
            this.socket.client.Split = true;

        // eject mass
        if (this.owner.minionEject)
            this.socket.client.pressW = true;

        // follow owners mouse by default
        this.mouse = this.owner.mouse;

        // pellet-collecting mode
        if (this.owner.collectPellets) {
            this.viewNodes = [];
            var self = this;
            this.viewBox = this.owner.viewBox;
            this.server.quadTree.find(this.viewBox, function (check) {
                if (check.cellType == 1) self.viewNodes.push(check);
            });
            var bestDistance = 1e999;
            for (var i in this.viewNodes) {
                var cell = this.viewNodes[i];
                var dx = this.cells[0].position.x - cell.position.x;
                var dy = this.cells[0].position.y - cell.position.y;
                if (dx * dx + dy * dy < bestDistance) {
                    bestDistance = dx * dx + dy * dy;
                    this.mouse = cell.position;
                }
            }
        }
    }
}

module.exports = MinionPlayer;