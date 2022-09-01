class Mode {
    constructor() {
        this.ID = -1;
        this.name = "Blank";
        this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
        this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
        this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams

        this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
        this.IsTournament = false;
    }
    // Override these
    onServerInit(server) {
        // Called when the server starts
        server.run = true;
    }
    onTick(server) {
        // Called on every game tick 
    }
    onChange(server) {
        // Called when someone changes the gamemode via console commands
    }
    onPlayerInit(player) {
        // Called after a player object is constructed
    }
    onPlayerSpawn(server, player) {
        // Called when a player is spawned
        player.setColor(server.getRandomColor()); // Random color
        server.spawnPlayer(player);
    }
    onCellAdd(cell) {
        // Called when a player cell is added
    }
    onCellRemove(cell) {
        // Called when a player cell is removed
    }
    onCellMove(cell, server) {
        // Called when a player cell is moved
    }
    updateLB(server) {
        server.leaderboardType = this.packetLB;
        // Called when the leaderboard update function is called
    }
    onClientSocketClose(server, socket) {
        // override this in tournament inherited game modes
    }
}

module.exports = Mode;