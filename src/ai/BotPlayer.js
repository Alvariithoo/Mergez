﻿const Player = require('../Player');
const Vector = require('vector2-node');
const Cell = require('../entity/Cell');

class BotPlayer extends Player {
    /**
     * @param {any} server
     * @param {import("./FakeSocket")} socket
     */
    constructor(server, socket) {
        super(server, socket);
        this.splitCooldown = 0;
    }
    getLowestCell() {
        if (this.cells.length === 0) {
            return null; // Error!
        }

        // Sort the cells by size to avoid errors
        const sortedCells = [...this.cells].sort((a, b) => b.getSize() - a.getSize());

        return sortedCells[0];
    }
    checkConnection() {
        if (this.socket.isCloseRequest) {
            while (this.cells.length > 0) {
                this.server.removeNode(this.cells[0]);
            }
            this.isRemoved = true;
            return;
        }

        // Respawn if bot is dead
        if (this.cells.length <= 0) {
            this.server.gameMode.onPlayerSpawn(this.server, this);
            if (this.cells.length === 0) {
                // If the bot cannot spawn any cells, then disconnect it
                this.socket.close();
            }
        }
    }
    sendUpdate() { // Overrides the update function from player tracker
        if (this.splitCooldown > 0) this.splitCooldown--;

        // Calc predators/prey
        const cell = this.getLowestCell();

        // Action
        this.decide(cell);
    }
    /**
     * @param {{ position: any; owner: { team: any; }; _size: number; }} cell
     */
    decide(cell) {
        if (!cell) return; // Cell was eaten, check in the next tick (I'm too lazy)

        const cellPos = cell.position;
        const result = new Vector(0, 0);
        // Splitting
        let split = false;
        let splitTarget = null;
        const threats = [];

        for (let i = 0; i < this.viewNodes.length; i++) {
            const check = this.viewNodes[i];
            if (check.owner === this) continue;

            // Get attraction of the cells - avoid larger cells, viruses and same team cells
            let influence = 0;
            if (check.cellType === 0) {
                // Player cell
                if (this.server.gameMode.haveTeams && (cell.owner.team === check.owner.team)) {
                    // Same team cell
                    influence = 0;
                } else if (cell._size > (check._size + 4) * 1.15) {
                    // Can eat it
                    influence = check._size * 2.5;
                } else if (check._size + 4 > cell._size * 1.15) {
                    // Can eat me
                    influence = -check._size;
                } else {
                    influence = -(check._size / cell._size) / 3;
                }
            } else if (check.cellType === 1) {
                // Food
                influence = 1;
            } else if (check.cellType === 2) {
                // Virus
                if (cell._size > check._size * 1.15) {
                    // Can eat it
                    if (this.cells.length === this.server.config.playerMaxCells) {
                        // Won't explode
                        influence = check._size * 2.5;
                    } else {
                        // Can explode
                        influence = -1;
                    }
                } else if (check.isMotherCell && check._size > cell._size * 1.15) {
                    // can eat me
                    influence = -1;
                }
            } else if (check.cellType === 3) {
                // Ejected mass
                if (cell._size > check._size * 1.15)
                    // can eat
                    influence = check._size;
            } else {
                influence = check._size; // Might be TeamZ
            }

            // Apply influence if it isn't 0 or my cell
            if (influence === 0 || cell.owner === check.owner)
                continue;

            // Calculate separation between cell and check
            const checkPos = check.position;
            const displacement = new Vector(checkPos.x - cellPos.x, checkPos.y - cellPos.y);

            // Figure out distance between cells
            let distance = displacement.length();
            if (influence < 0) {
                // Get edge distance
                distance -= cell._size + check._size;
                if (check.cellType === 0) threats.push(check);
            }

            // The farther they are the smaller influnce it is
            if (distance < 1) distance = 1; // Avoid NaN and positive influence with negative distance & attraction
            influence /= distance;

            // Splitting conditions
            splitTarget = check;
            split = true;
        }

        // Normalize the resulting vector
        result.normalize();

        // Check for splitkilling and threats
        if (split) {
            // Can be shortened but I'm too lazy
            if (threats.length > 0) {
                if (this.largest(threats)._size > cell._size * 1.3) {
                    return;
                }
            } else {
                // Splitkill the target
                this.mouse = {
                    x: splitTarget.position.x,
                    y: splitTarget.position.y
                }
                this.splitCooldown = 1000;
                this.socket.client.Split = true;
                if (this.cells.length <= 2) {
                    this.socket.player.Split(2);
                    setTimeout(() => {
                        this.socket.player.Split(5);
                    }, 450)
                } else {
                    this.mouse = {
                        x: cellPos.x,
                        y: cellPos.y
                    }
                }
                return;
            }
        }
        this.mouse = {
            x: cellPos.x + result.x * 800,
            y: cellPos.y + result.y * 800
        }
    }

    /**
     * @param {any[]} list
     */
    largest(list) {
        // Sort the cells by size to avoid errors
        const sorted = [...list].sort((a, b) => b._size - a._size);

        return sorted[0];
    }
}

module.exports = BotPlayer;