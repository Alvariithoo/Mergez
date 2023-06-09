const Server = require("../Server");
const Logger = require("../modules/Logger");
const ip = require("ip");

class Room {
    constructor({ port, owner, instance }) {
        this.instance = instance; // wager manager
        this.owner = owner;
        this.players = [ owner ];
        this.isRunning = false;
        this.server = new Server(port);
        this.server.onClose = () => {
            Logger.info("Killing \x1b[34m" + this.code + "\x1b[37m.");
            this.instance.update();
            this.players.forEach(socket => {
                socket.client.endGame();
                socket.client.room = null;
                socket.client.isPlaying = false;
            })
        };
        this.code = this.server.room.roomID;
        this.address = ip.address() + ':' + port;

        Logger.info("Queuing \x1b[34m" + this.code + "\x1b[37m.");
    }

    start() {
        this.server.start();
        this.isRunning = true;
        this.players.forEach(socket => {
            socket.client.startRoom(this.address);
            socket.client.isPlaying = true;
        });
        this.instance.update();
    }

    join(socket) {
        if(this.players.length > 2) {
            socket.client.sendError("Sorry! Room is full!");
        };
        this.players.push(socket);
        this.start();
    }

    close() {
        this.server.close();
    }
}

module.exports = Room;