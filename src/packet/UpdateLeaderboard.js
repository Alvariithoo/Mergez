// Import
const BinaryWriter = require("./BinaryWriter");

class UpdateLeaderboard {
    constructor(player, leaderboard, leaderboardType) {    
        this.player = player;
        this.leaderboard = leaderboard;
        this.leaderboardType = leaderboardType;
        this.newFormat = player.minimapIDs;
    }

    build(protocol) {
        switch (this.leaderboardType) {
            case 48:
            // UserText
            return this.buildUserText(protocol);
            case 49:
            // FFA
            if (protocol < 6)
                return this.buildFfa5();
            return this.buildFfa6();
            case 50:
            // Team
            return this.buildTeam();
            default:
            return null;
        }
    }

    // UserText
    buildUserText(protocol) {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x31);                                // Packet ID
        writer.writeUInt32(this.leaderboard.length >>> 0);       // Number of elements
        for (var i = 0; i < this.leaderboard.length; i++) {
            var item = this.leaderboard[i];
            if (item == null) return null;  // bad leaderboardm just don't send it
            
            var name = item;
            name = name ? name : "";
            var id = 0;
            
            writer.writeUInt32(id >> 0);                        // isMe flag/cell ID
            if (protocol <= 5)
                writer.writeStringZeroUnicode(name);
            else
                writer.writeStringZeroUtf8(name);

            if (this.player.clientVersion >= 96) {
                if (this.newFormat) {
                    writer.writeInt32(0);
                } else {
                    writer.writeDouble(0);
                }
            }
        }
        return writer.toBuffer();
    };

    // FFA protocol 5
    buildFfa5() {
        var player = this.player;
        if (player.spectate && player.spectateTarget != null) {
            player = player.spectateTarget;
        }
        var writer = new BinaryWriter();
        writer.writeUInt8(0x31);                                // Packet ID
        writer.writeUInt32(this.leaderboard.length >>> 0);       // Number of elements
        for (var i = 0; i < this.leaderboard.length; i++) {
            var item = this.leaderboard[i];
            if (item == null) return null;  // bad leaderboardm just don't send it
            
            var name = item.getNameUnicode();
            var id = 0;
            if (item == player && item.cells.length > 0) {
                id = item.cells[0].nodeId ^ this.player.scrambleId;
            }
            
            writer.writeUInt32(id >>> 0);   // Player cell Id
            if (name != null)
                writer.writeBytes(name);
            else
                writer.writeUInt16(0);
                
            if (this.player.clientVersion >= 96) {
                if (this.newFormat) {
                    writer.writeInt32(item.userID ? item.userID : 0);
                } else {
                    writer.writeDouble(item.userID ? item.userID : 0);
                }
            }
        }
        return writer.toBuffer();
    };

    // FFA protocol 6
    buildFfa6() {
        var player = this.player;
        if (player.spectate && player.spectateTarget != null) {
            player = player.spectateTarget;
        }
        var writer = new BinaryWriter();
        writer.writeUInt8(0x31);                                // Packet ID
        writer.writeUInt32(this.leaderboard.length >>> 0);       // Number of elements
        for (var i = 0; i < this.leaderboard.length; i++) {
            var item = this.leaderboard[i];
            if (item == null) return null;  // bad leaderboardm just don't send it
            
            var name = item.getNameUtf8();
            var id = item == player ? 1 : 0;
            
            writer.writeUInt32(id >>> 0);   // isMe flag
            if (name != null)
                writer.writeBytes(name);
            else
                writer.writeUInt8(0);
        }
        return writer.toBuffer();
    };

    // Team
    buildTeam() {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x32);                                // Packet ID
        writer.writeUInt32(this.leaderboard.length >>> 0);       // Number of elements
        for (var i = 0; i < this.leaderboard.length; i++) {
            var value = this.leaderboard[i];
            if (value == null) return null;  // bad leaderboardm just don't send it
            
            if (isNaN(value)) value = 0;
            value = value < 0 ? 0 : value;
            value = value > 1 ? 1 : value;
            
            writer.writeFloat(value);                // isMe flag (previously cell ID)
        }
        return writer.toBuffer();
    };
}

module.exports = UpdateLeaderboard;