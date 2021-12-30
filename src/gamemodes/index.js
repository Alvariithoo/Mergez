module.exports = {
    Mode: require('./Mode'),
    FFA: require('./FFA'),
    Ultra: require('./Ultra'),
};

var get = function (id) {
    var mode;
    switch (parseInt(id)) {
        case 1:// Ultra
            mode = new module.exports.Ultra();
            break;
        default:// FFA is default
            mode = new module.exports.FFA();
            break;
    }
    return mode;
};

module.exports.get = get;
