// A fake socket for bot players

class FakeSocket {
    constructor(server) {
        this.server = server;
        this.isCloseRequest = false;
    }

    // Override
    sendPacket(packet) {
        // Fakes sending a packet
        return;
    };

    close(error) {
        this.isCloseRequest = true;
    };
}

module.exports = FakeSocket;