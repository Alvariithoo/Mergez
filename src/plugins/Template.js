// Example plugin Make sure if you are using multiple files, they are in a seprate folder named the plugin's name.
class Example {
    constructor(server, PluginsLoader, Logger) {
        this.server = server;
        this.Logger = Logger;
        this.PluginsLoader = PluginsLoader;
        this.name = "Example";  // Required
        this.author = "Example"; // Required
        this.version = "1.0.0"; // Required
        this.active = false; // Required true or false
    }

    start() {
        // Replace Functions. This is called by PluginsLoader
        this.Logger("HI", this.name); // Says Hi
        this.PluginsLoader.addCommand("example", function(server, split) {
            var id = split[1]; // Id part not neccasary
            // Command Stuff
        
        });
        this.PluginsLoader.addPlayerCommand("example", function(PlayerCommand, args, playerTracker, server) {
            var id = args[1]; // Id part not neccasary 
            // Command Stuff
        });
    };
}
module.exports = Example;