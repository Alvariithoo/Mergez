// Import
const BinaryWriter = require('./BinaryWriter');

class UpdateRedArea {
    constructor(server, redArea) {
        this.server = server;
        this.redArea = redArea;
    }
    build(protocol) {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x7B);                                // Packet ID - dec -> 67

        writer.writeInt16(this.redArea.curPos.x >>> 0);
        writer.writeInt16(this.redArea.curPos.y >>> 0);

        writer.writeInt16(this.redArea.nextPos.x >>> 0);
        writer.writeInt16(this.redArea.nextPos.y >>> 0);

        writer.writeInt16(this.redArea.curRadius >>> 0);
        writer.writeInt16(this.redArea.nextRadius >>> 0);

        return writer.toBuffer();
    }
}

module.exports = UpdateRedArea;