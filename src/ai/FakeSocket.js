// A fake socket for bot players
class FakeSocket {
    /**
     * @param {any} server
     * @param {any} player
     * @param {any} client
     */
    constructor(server, player, client) {
        this.server = server;
        this.player = player;
        this.client = client;
        this.isCloseRequest = false;
        this.isConnected = undefined;
    }
    // Override
    sendPacket() {
        // Fakes sending a packet
        return;
    }
    close() {
        this.isCloseRequest = true;
    }
}

module.exports = FakeSocket;