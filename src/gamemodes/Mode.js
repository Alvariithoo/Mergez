function Mode() {
    this.ID = -1;
    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
    
    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
    this.IsTournament = false;
}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function (server) {
    // Called when the server starts
    server.run = true;
};

Mode.prototype.onTick = function (server) {
    // Called on every game tick 
};

Mode.prototype.onChange = function (server) {
    // Called when someone changes the gamemode via console commands
};

Mode.prototype.onPlayerInit = function (player) {
    // Called after a player object is constructed
};

Mode.prototype.onPlayerSpawn = function (server, player) {
    // Called when a player is spawned
    player.setColor(server.getRandomColor()); // Random color
    server.spawnPlayer(player);
};

Mode.prototype.onCellAdd = function (cell) {
    // Called when a player cell is added
};

Mode.prototype.onCellRemove = function (cell) {
    // Called when a player cell is removed
};

Mode.prototype.onCellMove = function (cell, server) {
    // Called when a player cell is moved
};

Mode.prototype.updateLB = function (server) {
    server.leaderboardType = this.packetLB;
    // Called when the leaderboard update function is called
};

Mode.prototype.onClientSocketClose = function (server, socket) {
    // override this in tournament inherited game modes
};