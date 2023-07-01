const Room = require("./Room");

class Client {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.chatMessages = [];
        this.isPlaying = false;
        this.room;

        this.update();
    }

    async handleMessage(message) {
        try {
            const data = JSON.parse(message);
            const Action = this.server.ActionEnum;
            this.socket.lastSeen = new Date().valueOf();

            switch (data.type) {
                case Action.MESSAGE: {
                    const message = data.message;

                    if (!data.message || !data.message.trim().length) return;

                    if (this.server.checkBadWord(message)) {
                        this.sendChatMessage(null, "Stop insulting others! Keep calm and be friendly please");
                        return;
                    }

                    if (this.chatMessages.filter(({ timestamp }) => new Date().valueOf() - timestamp <= this.server.chatMessagesThreshold * 1E3).length >= this.server.chatMessagesLimit) {
                        this.sendChatMessage(null, "Hey, calm down. You are sending messages too quickly!");
                        return;
                    }

                    const chatItem = {
                        timestamp: new Date().valueOf(),
                        message: message.substr(0, 64)
                    };

                    this.chatMessages.push(chatItem);
                    this.emitChatMessage(message.substr(0, 64));
                    break;
                }
                case Action.CREATE_ROOM: {
                    if (this.room) return this.sendError("You have already created a room!");
                    await this.createRoom();
                    break;
                }
                case Action.CLOSE_ROOM: {
                    if (!this.room) return this.sendError("You haven't created a room yet!");
                    this.closeRoom();
                    break;
                }
                case Action.JOIN_ROOM: {
                    if (this.room) return this.sendError("You are already playing!");
                    this.joinRoom(data.code);
                    break;
                }
                case Action.SET_NICK: {
                    if (!data.nickname || !data.nickname.length || !data.nickname.trim().length) return;
                    this.socket.nickname = data.nickname.substr(0, 32) || "Guest";
                    break;
                }
                default: {
                    this.sendError("Woops! Something went wrong.");
                    break;
                }
            }
        } catch (error) {
            // unexpected request
        }
    }

    send(message) {
        this.socket.send(JSON.stringify(message));
    }

    emitChatMessage(message) {
        this.server.emit({
            type: this.server.ActionEnum.MESSAGE,
            sender: this.socket.nickname || "Guest",
            color: this.socket.color,
            message
        })
    }

    sendChatMessage(from, message, color = this.server.colors.serverColor) {
        this.send({
            type: this.server.ActionEnum.MESSAGE,
            sender: from || "SERVER",
            color: color,
            message
        })
    }

    sendError(message) {
        this.send({
            type: this.server.ActionEnum.ERROR,
            message
        });
    }

    update() {
        this.send({
            type: this.server.ActionEnum.UPDATE,
            roomList: [...this.server.rooms.entries()].map(([key, value]) => {
                const { owner, code, isRunning } = value;
                return { owner: owner.nickname, code, isRunning };
            }).filter(room => !room.isRunning),
            playerCount: this.server.sockets.size
        });
    }

    async createRoom() {
        const port = await this.server.randomPort();

        this.room = new Room({ port, owner: this.socket, instance: this.server });
        this.server.rooms.set(this.room.code, this.room);

        this.server.update();
        this.send({
            type: this.server.ActionEnum.INITIALIZED_ROOM,
            code: this.room.code
        });
    }

    closeRoom() {
        if (this.room.isRunning) return this.sendError("You are already playing!");
        this.server.rooms.delete(this.room.code);
        this.room.close();
        this.server.update();
        this.room = null;
    }

    joinRoom(code) {
        const room = this.server.rooms.get(code);

        if (!room) return this.sendError("Room not found!");
        if (room.isRunning) return this.sendError("Room is running!");

        room.join(this.socket);
    }

    startRoom(address) {
        this.send({
            type: this.server.ActionEnum.STARTING_ROOM,
            ip: address
        });
    }

    endGame() {
        this.send({ type: this.server.ActionEnum.ENDGAME });
    }

    close() {
        if (this.room) {
            this.server.rooms.delete(this.room.code);
            this.room.close();
            this.update();
        }
        this.server.sockets.delete(this.socket);
    }
}

module.exports = Client;