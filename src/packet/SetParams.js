// Import
const BinaryWriter = require('./BinaryWriter');

class SetParams {
    /**
     * @param {any} server
     */
    constructor(server) {
        this.server = server;
    }
    build(protocol) {
        const writer = new BinaryWriter();
        writer.writeUInt8(0x65); // Packet ID
        writer.writeUInt32(this.server.config.serverVersionCode);

        let flags = 0;
        if (this.server.gameMode.hideLeaderBoardNumbers) { //for tournaments
            flags = flags | 1;
        }
        if (this.server.gameMode.showAllPlayersOnMinimap) { //for tournaments
            flags = flags | 2;
        }

        writer.writeUInt32(flags); //flags
        return writer.toBuffer();
    }
}

module.exports = SetParams;