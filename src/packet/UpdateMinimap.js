﻿// Import
var BinaryWriter = require("./BinaryWriter");
var WebSocket = require("ws");

function UpdateMinimap(player, clients) {
    this.player = player;
    this.clients = clients;
    this.torunament = player.server.gameMode.IsTournament;
}

module.exports = UpdateMinimap;

UpdateMinimap.prototype.build = function (protocol) {

    var player = this.player;
    var clients = this.clients;

    if (!player.sendFriendsCoords) {
        return;
    }

    var writer = new BinaryWriter();
    writer.writeUInt8(0x43);                                // Packet ID - dec -> 67

    var count = 0;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].player.socket.readyState == WebSocket.OPEN &&
            clients[i].player.cells.length > 0 &&
            clients[i].player != player &&
            (clients[i].player.userID != 0 || this.torunament)) {
            count++;
        }
    }
    writer.writeInt16(count >>> 0);       // Number of elements

    for (var i = 0; i < clients.length; i++) {
        if (clients[i].player.socket.readyState == WebSocket.OPEN &&
            clients[i].player.cells.length > 0 &&
            clients[i].player != player &&
            (clients[i].player.userID != 0 || this.torunament)) {
            //console.log(clients[i].player.userID+"  "+clients[i].player.centerPos.x+":"+clients[i].player.centerPos.y);
            writer.writeInt32(clients[i].player.userID);
            writer.writeInt32(clients[i].player.pID);
            writer.writeInt16(clients[i].player.centerPos.x);
            writer.writeInt16(clients[i].player.centerPos.y);
        }
    }

    return writer.toBuffer();

}