const Commands = require('./modules/CommandList');
const PlayerCommand = require('./modules/PlayerCommand');
const fs = require('fs');

class Plugins {
	constructor(server) {
		this.server = server;
		this.pluginsdir = [];
		this.plugins = {};
		this.commands = {};
		this.playerCommands = {};
	};

	load() {
		this.pluginsdir = this.getFiles('../src/plugins');
		this.start();
	};

	start() {
		this.Log(this.pluginsdir.length + " Plugins loaded!");
		for (var i in this.pluginsdir) {
			if (this.pluginsdir[i] == '../src/plugins/Readme.md')
				continue;
			var plugindir = require(this.pluginsdir[i]);
			var plugin = new plugindir(this.server, this, function (message, name) {
				console.log("\u001B[34m\u001B[1m[" + name + "] " + "\u001B[37m" + message);
			});
			if (!plugin.active)
				continue;
			this.plugins[plugin.name] = plugin;
			this.Log(plugin.name + " " + plugin.version + " By " + plugin.author + " Has been loaded!");
			plugin.start();
		}
	};

	addCommand(name, funct) {
		this.commands[name] = funct;
	};

	addPlayerCommand(name, funct) {
		this.playerCommands[name] = funct;
	};

	Log(message) {
		console.log("\u001B[1m\u001B[32m[MODS] " + message);
	};
	
	getFiles(dir, files_) {
		files_ = files_ || [];
		var files = fs.readdirSync(dir);
		for (var i in files) {
			var name = dir + '/' + files[i];
			if (fs.statSync(name).isDirectory()) {
				getFiles(name, files_);
			} else {
				files_.push(name);
			}
		}
		return files_;
	};
}

module.exports = Plugins;