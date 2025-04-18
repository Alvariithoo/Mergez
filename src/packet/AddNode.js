﻿const BinaryWriter = require('./BinaryWriter');

class AddNode {
    /**
     * @param {any} player
     * @param {any} item
     */
    constructor(player, item) {
        this.player = player;
        this.item = item;
    }
    build(protocol) {
        const writer = new BinaryWriter();
        writer.writeUInt8(0x20); // Packet ID
        writer.writeUInt32((this.item.nodeId ^ this.player.scrambleId) >>> 0);
        return writer.toBuffer();
    }
}

module.exports = AddNode;