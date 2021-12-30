function UpdatePosition(player, x, y, scale) {
    this.player = player,
    this.x = x;
    this.y = y;
    this.scale = scale;
}

module.exports = UpdatePosition;

UpdatePosition.prototype.build = function (protocol) {
    var buffer = new Buffer(13);
    var offset = 0;
    buffer.writeUInt8(0x11, offset, true);
    offset += 1;
    buffer.writeFloatLE(this.x + this.player.scrambleX, offset, true);
    offset += 4;
    buffer.writeFloatLE(this.y + this.player.scrambleY, offset, true);
    offset += 4;
    buffer.writeFloatLE(this.scale, offset, true);
    offset += 4;
    return buffer;
};
