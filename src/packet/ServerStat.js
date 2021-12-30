// Import
var BinaryWriter = require("./BinaryWriter");

function ServerStat(player) {
    this.player = player;
};

module.exports = ServerStat;

ServerStat.prototype.build = function (protocol) {
    var server = this.player.server;
    // Get server statistics
    var totalPlayers = 0;
    var alivePlayers = 0;
    var spectPlayers = 0;
    for (var i = 0; i < server.clients.length; i++) {
        var socket = server.clients[i];
        if (socket == null || !socket.isConnected)
            continue;
        totalPlayers++;
        if (socket.player.cells.length > 0)
            alivePlayers++;
        else
            spectPlayers++;
    }
    var obj = {
        'name': server.config.serverName,
        'mode': server.gameMode.name,
        'uptime': process.uptime() >>> 0,
        'update': server.updateTimeAvg.toFixed(3),
        'playersTotal': totalPlayers,
        'playersAlive': alivePlayers,
        'playersSpect': spectPlayers,
        'playersLimit': server.config.serverMaxConnections
    };
    var json = JSON.stringify(obj);
    // Serialize
    var writer = new BinaryWriter();
    writer.writeUInt8(254);             // Message Id
    writer.writeStringZeroUtf8(json);   // JSON
    return writer.toBuffer();
};
