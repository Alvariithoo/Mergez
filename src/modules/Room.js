const { nanoid } = require("nanoid");
class Room {
    constructor({ isPublic = true, isTest = false } = {}) {
        this.roomID = 'm' + nanoid(5);
        this.isPublic = isPublic;
        this.test = isTest;
    }
}

module.exports = Room;