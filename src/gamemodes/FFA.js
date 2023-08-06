const Mode = require('./Mode');

class FFA extends Mode {
    constructor() {
        super();
        this.ID = 0;
        this.name = "FFA";
        this.specByLeaderboard = true;
        this.redAreaDecayRate = undefined;
    }
    onPlayerSpawn(server, player) {
        player.setColor(player.isMinion ? { r: 240, g: 240, b: 255} : server.getRandomColor());
        server.spawnPlayer(player);
    }
    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (let i = 0, pos = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||player.socket.isConnected == false)
                continue;
            for (let j = 0; j < pos; j++)
                if (lb[j]._score < player._score)
                    break;
            lb.splice(j, 0, player);
            pos++;
        }
        this.rankOne = lb[0];
    }
}

module.exports = FFA;