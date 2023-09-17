const FFA = require('./FFA');
const Logger = require('../modules/Logger');
const EarnSystem = require('../mongoose/EarnSystem');

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
        this.config.serverMaxConnections = 33;
        this.config.serverSpectatorScale = 0.1;

        this.config.borderWidth = 25000;
        this.config.borderHeight = 25000;

        this.config.foodMinSize = 20;
        this.config.foodMaxSize = 20;

        this.config.foodMinAmount = 500;
        this.config.foodMaxAmount = 1000;

        this.config.virusMaxSize = 120;
        this.config.virusMaxAmount = 5;

        this.config.ejectSize = 32.06;
        this.config.ejectSizeLoss = 33.23;
        this.config.ejectCooldown = 0;

        this.config.playerMinSize = 84;
        this.config.playerMaxSize = 150000000;
        this.config.playerMinSplitSize = 121;
        this.config.playerStartSize = 1000;
        this.config.playerMaxCells = 138;
        this.config.playerSpeed = 1.6;
        this.config.playerDecayRate = .00275;
        this.config.playerRecombineTime = 0;

        this.config.ejectSpawnPlayer = 0;

        this.RewardCoins = this.config.RewardCoins;
        this.RewardExp = this.config.RewardExp;

        this.restartInterval = this.config.ultraRestartCounterDuration * 1000; // 10 sec
        this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

        this.scoreLimit = this.config.ultraRestartMassLimit;
        this.winner;

        // discord Mergez
        server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        setInterval(()=>{
            server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        }, 5 * 60000 * 3)
    }
    onPlayerSpawn(server, player) {
        const playerSize = server.config.playerStartSize;
        const random = (Math.floor(Math.random() * 100) < 2);
        player.setColor(player.isMinion ? { r: 240, g: 240, b: 255} : server.getRandomColor());
        Logger.info(`Joined: ${player._name} | Discord ID: ${player._id || "unregister"}`)
        random ? server.sendChatMessage(null, player, 'You spawned with double mass!') : null;
        server.spawnPlayer(player, null, random ? playerSize * 1.41 : playerSize);
    }
    startRestartTimer(server, name, uid) {
        this.winner = name;

        if (this.restarting) {
            return;
        }

        this.restarting = true;
        let congratolations = `Congratolations to ${this.winner}!`;
        server.sendChatMessage(null, null, congratolations);

        const Earn = new EarnSystem();
        const UserID = uid;
        Earn.updateCoinsExp(UserID, this.RewardCoins, this.RewardExp);

        setTimeout(function () {
            server.restart();
            // @ts-ignore
            this.downCounter = this.restartInterval / 1000;
            this.restarting = false;
        }.bind(this), this.restartInterval);
    }
    checkScoreLimit(server) {
        for (let i = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||player.socket.isConnected == false)
                continue;

            var playerScore = player.getScore();

            if (!this.restarting &&
                playerScore / 100 > this.scoreLimit &&
                player.cells.length > 0) {
                this.startRestartTimer(server, player._name.split(this.config.hatCode)[0], player._id);
            }
        }
    }
    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (let i = 0, pos = 0; i < server.clients.length; i++) {
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
                "Won The Game!",
                "Rewards:",
                this.RewardExp + " xp",
                this.RewardCoins + " coins"
            ];
            server.leaderboard = restart;
            server.leaderboardType = 48;
        }
    }
}

module.exports = Ultra;