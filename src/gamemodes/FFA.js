var Mode = require('./Mode');

function FFA() {
    Mode.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 0;
    this.name = "FFA";
    this.specByLeaderboard = true;
}

module.exports = FFA;
FFA.prototype = new Mode();

// Gamemode Specific Functions

FFA.prototype.leaderboardAddSort = function (player, leaderboard) {
    // Adds the player and sorts the leaderboard
    var len = leaderboard.length - 1;
    var loop = true;
    while ((len >= 0) && (loop)) {
        // Start from the bottom of the leaderboard
        if (player.getScore() <= leaderboard[len].getScore()) {
            leaderboard.splice(len + 1, 0, player);
            loop = false; // End the loop if a spot is found
        }
        len--;
    }
    if (loop) {
        // Add to top of the list because no spots were found
        leaderboard.splice(0, 0, player);
    }
};

// Override

FFA.prototype.onPlayerSpawn = function (server, player) {
    function r(g){
        g = server.config.playerStartSize;
        if(Math.floor(Math.random()*100)<2) {
            player.setColor(player.isMinion ? { r: 240, g: 240, b: 255 } : server.getRandomColor());
        // Spawn player
        server.sendChatMessage(null, player, 'You spawned with double mass!');
        console.log('Joined [*]: ' + player._name)
        server.spawnPlayer(player, null, g*1.41);
        }
        else {
            player.setColor(player.isMinion ? { r: 240, g: 240, b: 255 } : server.getRandomColor());
        // Spawn player
        console.log('Joined: ' + player._name)
        server.spawnPlayer(player, null, g);
        }
    }
    r()
};

FFA.prototype.updateLB = function (server) {
    server.leaderboardType = this.packetLB;
    var lb = server.leaderboard;
    // Loop through all clients
    for (var i = 0; i < server.clients.length; i++) {
        var client = server.clients[i];
        if (client == null) continue;
        
        var player = client.player;
        if (player.isRemoved)
            continue; // Don't add disconnected players to list
        
        var playerScore = player.getScore();
        
        if (player.cells.length <= 0)
            continue;
        
        if (lb.length == 0) {
            // Initial player
            lb.push(player);
            continue;
        } else if (lb.length < server.config.serverMaxLB) {
            this.leaderboardAddSort(player, lb);
        } else {
            // 10 in leaderboard already
            if (playerScore > lb[server.config.serverMaxLB - 1].getScore()) {
                lb.pop();
                this.leaderboardAddSort(player, lb);
            }
        }
    }
    
    this.rankOne = lb[0];
}
