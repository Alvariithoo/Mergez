// Import
var BinaryWriter = require("./BinaryWriter");


function SetParams(server) {
    this.server = server;
}

module.exports = SetParams;

SetParams.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x65);                                // Packet ID
    writer.writeUInt32(this.server.config.serverVersionCode);

    var flags = 0;
    if (this.server.gameMode.hideLeaderBoardNumbers) { //for tournaments
        flags = flags | 1;
    }
    if (this.server.gameMode.showAllPlayersOnMinimap) { //for tournaments
        flags = flags | 2;
    }

    writer.writeUInt32(flags); //flags
    return writer.toBuffer();
};
