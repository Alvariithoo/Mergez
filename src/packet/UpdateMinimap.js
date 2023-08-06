// Import
const BinaryWriter = require('./BinaryWriter');
const WebSocket = require('ws');

class UpdateMinimap {
    /**
     * @param {{ server: { gameMode: { IsTournament: any; }; }; }} player
     * @param {any} clients
     */
    constructor(player, clients) {
        this.player = player;
        this.clients = clients;
        this.torunament = player.server.gameMode.IsTournament;
    }
    build(protocol) {
        const player = this.player;
        const clients = this.clients;

        // if (!player.sendFriendsCoords) {
        //     return;
        // }

        const writer = new BinaryWriter();
        writer.writeUInt8(0x43);                                // Packet ID - dec -> 67

        let count = 0;
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].player.socket.readyState == WebSocket.OPEN &&
                clients[i].player.cells.length > 0 &&
                clients[i].player != player &&
                (clients[i].player.userID != 0 || this.torunament)) {
                count++;
            }
        }
        writer.writeInt16(count >>> 0);       // Number of elements

        for (let i = 0; i < clients.length; i++) {
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
}

module.exports = UpdateMinimap;