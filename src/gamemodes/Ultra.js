const FFA = require('./FFA');
const Logger = require('../modules/Logger');

class Ultra extends FFA {
    constructor() {
        super();
        this.ID = 1;
        this.name = "UltraSplit";
        this.specByLeaderboard = true;
        this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

        this.canRemergeLimit = 200;
        this.newPlayerCellBoostValue = 410;
        
        // if some player reach this limit, restart timer will be started
        this.restarting = false;
        this.winner;
        // Load Config
        this.config = require('../Settings.js');
    }
    onServerInit(server) {
        this.restartInterval = this.config.ultraRestartCounterDuration * 1000; // 10 sec
        this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

        this.scoreLimit = this.config.ultraRestartMassLimit;
        this.winner;

        // discord Mergez
        server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        setInterval(()=>{
            server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        }, 5 * 60000 * 3 * 2)
    }
    onPlayerSpawn(server, player) {
        const playerSize = server.config.playerStartSize;
        const random = (Math.floor(Math.random() * 100) < 2);
        player.setColor(player.isMinion ? { r: 240, g: 240, b: 255} : server.getRandomColor());
        Logger.info('Joined: ' + player._name)
        random ? server.sendChatMessage(null, player, 'You spawned with double mass!') : null;
        server.spawnPlayer(player, null, random ? playerSize * 1.41 : playerSize);
    }
    startRestartTimer(server, nick) {
        nick.split('$')[1]

        this.winner = nick.split("$")[0];

        if (this.restarting) {
            return;
        }

        this.restarting = true;
        let congratolations = 'Congratolations to ' + this.winner + '!';
        server.sendChatMessage(null, null, congratolations);
        setTimeout(function () {
            server.restart();
            this.downCounter = this.restartInterval / 1000;
            this.restarting = false;
        }.bind(this), this.restartInterval);
    }
    checkScoreLimit(server) {
        for (var i = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||player.socket.isConnected == false)
                continue;

            var playerScore = player.getScore();

            if (!this.restarting &&
                playerScore / 100 > this.scoreLimit &&
                player.cells.length > 0) {
                this.startRestartTimer(server, player._name);
            }
        }
    }
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

        // Make a messege in leaderboard
        this.checkScoreLimit(server);
        if (this.restarting) {
            const restart = [
                "Restarting",
                this.downCounter-- + "s",
                this.winner,
                "Won The Game!"
            ];
            server.leaderboard = restart;
            server.leaderboardType = 48;
        }
    }
}

module.exports = Ultra;