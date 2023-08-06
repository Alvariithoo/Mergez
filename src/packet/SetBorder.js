const BinaryWriter = require('./BinaryWriter');

class SetBorder {
    /**
     * @param {any} player
     * @param {any} border
     * @param {any} gameType
     * @param {any} serverName
     */
    constructor(player, border, gameType, serverName) {
        this.player = player;
        this.border = border;
        this.gameType = gameType;
        this.serverName = serverName;
    }
    build(protocol) {
        const scrambleX = this.player.scrambleX;
        const scrambleY = this.player.scrambleY;
        if (this.gameType == null) {
            const buffer = Buffer.alloc(33);
            buffer.writeUInt8(0x40, 0);
            buffer.writeDoubleLE(this.border.minx + scrambleX, 1);
            buffer.writeDoubleLE(this.border.miny + scrambleY, 9);
            buffer.writeDoubleLE(this.border.maxx + scrambleX, 17);
            buffer.writeDoubleLE(this.border.maxy + scrambleY, 25);
            return buffer;
        }
        const writer = new BinaryWriter();
        writer.writeUInt8(0x40); // Packet ID
        writer.writeDouble(this.border.minx + scrambleX);
        writer.writeDouble(this.border.miny + scrambleY);
        writer.writeDouble(this.border.maxx + scrambleX);
        writer.writeDouble(this.border.maxy + scrambleY);
        writer.writeUInt32(this.gameType >> 0);
        let name = this.serverName;
        if (name == null)
            name = "";
        if (protocol < 6)
            writer.writeStringZeroUnicode(name);
        else
            writer.writeStringZeroUtf8(name);
        return writer.toBuffer();
    }
}

module.exports = SetBorder;