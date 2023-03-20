// Example plugin Make sure if you are using multiple files, they are in a seprate folder named the plugin's name.
class Exampe {
    constructor(server, PluginHandler, Logger) {
        this.server = server;
        this.Logger = Logger;
        this.PluginHandler = PluginHandler;
        this.name = "Example";  // Required
        this.author = "Example"; // Required
        this.version = "1.0.0"; // Required
        this.active = false; // Required true or false
    }
    start = function () {
        // Replace Functions. This is called by PluginHandler
        this.Logger("HI", this.name); // Says Hi
    }
}

module.exports = Exampe;