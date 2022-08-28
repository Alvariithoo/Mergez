const Mode = require('./Mode');

class FFA extends Mode {
    constructor() {
        super();
        this.ID = 0;
        this.name = "FFA";
        this.specByLeaderboard = true;
    }

    // Override
    onPlayerSpawn(server, player) {
        const playerSize = server.config.playerStartSize;
        const random = (Math.floor(Math.random() * 100) < 2);
        player.setColor(player.isMinion ? { r: 240, g: 240, b: 255} : server.getRandomColor());
        console.log('Joined: ' + player._name)
        random ? server.sendChatMessage(null, player, 'You spawned with double mass!') : null;
        server.spawnPlayer(player, null, random ? playerSize * 1.41 : playerSize);
    };

    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (var i = 0, pos = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||player.socket.isConnected == false)
                continue;
            for (var j = 0; j < pos; j++)
                if (lb[j]._score < player._score)
                    break;
            lb.splice(j, 0, player);
            pos++;
        }
        this.rankOne = lb[0];
    }
}

module.exports = FFA;