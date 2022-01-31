const BinaryWriter = require("../packet/BinaryWriter");

function stringToBytes(str) {
    var writer = new BinaryWriter()
    writer.writeStringZeroUnicode(str);
    this._nameUnicode = writer.toBuffer();
    return writer.toBuffer();
};

module.exports = stringToBytes