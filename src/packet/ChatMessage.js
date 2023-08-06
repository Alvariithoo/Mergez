const BinaryWriter = require('./BinaryWriter');
// @ts-ignore
const UserRoleEnum = require('../enum/UserRoleEnum');

class ChatMessage {
    /**
     * @param {any} sender
     * @param {any} message
     */
    constructor(sender, message) {
        this.sender = sender;
        this.message = message;
    }
    build(protocol) {
        let text = this.message;
        if (text == null) text = "";
        let name = "SERVER";
        let color = { 'r': 0x9B, 'g': 0x9B, 'b': 0x9B };
        if (this.sender != null) {
            name = this.sender.getName();
            if (name == null || name.length == 0) {
                if (this.sender.cells.length > 0)
                    name = "Mergez.eu";
                else
                    name = "Spectator";
            }
            if (this.sender.cells.length > 0) {
                color = this.sender.cells[0].getColor();
            }
        }

        const writer = new BinaryWriter();
        writer.writeUInt8(0x63);            // message id (decimal 99)

        // flags
        let flags = 0;
        if (this.sender == null)
            flags = 0x80;           // server message
        else if (this.sender.userRole == UserRoleEnum.ADMIN)
            flags = 0x40;           // admin message
        else if (this.sender.userRole == UserRoleEnum.MODER)
            flags = 0x20;           // moder message

        writer.writeUInt8(flags);
        writer.writeUInt8(color.r >> 0);
        writer.writeUInt8(color.g >> 0);
        writer.writeUInt8(color.b >> 0);
        if (protocol <= 5) {
            writer.writeStringZeroUnicode(name);
            writer.writeStringZeroUnicode(text);
        } else {
            writer.writeStringZeroUtf8(name);
            writer.writeStringZeroUtf8(text);
        }
        return writer.toBuffer();
    }
}

module.exports = ChatMessage;