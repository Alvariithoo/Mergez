const Player = require('../Player');

class MinionPlayer extends Player {
    /**
     * @param {any} server
     * @param {import("./FakeSocket")} socket
     * @param {any} owner
     */
    constructor(server, socket, owner) {
        super(server, socket);
        this.owner = owner;
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
            this.joinGame(this.owner._name, this.owner._hat, this.owner._skin, this.owner._id);
            if (!this.cells.length) this.socket.close();
        }

        // Remove if owner has disconnected or has no control
        if (!this.owner.socket.isConnected || !this.owner.minionControl)
            this.socket.close();

        // Frozen or not
        this.frozen = this.owner.minionFrozen;

        // Split cells
        this.socket.client.Split = this.owner.minionSplit;

        // Eject mass
        this.socket.client.pressW = this.owner.minionEject;

        // Follow owner's mouse by default
        this.mouse = this.owner.mouse;

        // Pellet-collecting mode
        if (this.owner.collectPellets) {
            this.viewNodes = [];
            const self = this;
            this.viewBox = this.owner.viewBox;
            this.server.quadTree.find(this.viewBox, (check) => {
                if (check.cellType === 1) self.viewNodes.push(check);
            });

            let bestDistance = 1e999;
            for (const cell of this.viewNodes) {
                const dx = this.cells[0].position.x - cell.position.x;
                const dy = this.cells[0].position.y - cell.position.y;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < bestDistance) {
                    bestDistance = distanceSquared;
                    this.mouse = cell.position;
                }
            }
        }
    }
}

module.exports = MinionPlayer;