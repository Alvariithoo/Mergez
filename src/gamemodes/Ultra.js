const FFA = require('./FFA');
const BinaryWriter = require("../packet/BinaryWriter");
const Entity = require('../entity');
const stringToBytes = require('../modules/stringToBytes')

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
        this.config = require("../Settings.js");
    };

    onServerInit(server) {
        this.config.serverMaxConnections = 33;
        this.config.serverSpectatorScale = 0.1;

        this.config.borderWidth = 27000;
        this.config.borderHeight = 27000;

        this.config.foodMinSize = 20;
        this.config.foodMaxSize = 20;

        this.config.foodMinAmount = 500;
        this.config.foodMaxAmount = 1000;

        this.config.virusMaxSize = 120;
        this.config.virusMaxAmount = 0;

        this.config.ejectSize = 32.06;
        this.config.ejectSizeLoss = 32.23;
        this.config.ejectCooldown = 0;

        this.config.playerMinSize = 84;//85
        this.config.playerMaxSize = 150000000;
        this.config.playerMinSplitSize = 121; //121
        this.config.playerStartSize = 1200;
        this.config.playerMaxCells = 138;
        this.config.playerSpeed = 1.6;
        this.config.playerDecayRate = .001;
        this.config.playerRecombineTime = 0;

        this.config.ejectSpawnPlayer = 0;

        this.restartInterval = this.config.ultraRestartCounterDuration * 1000; // 10 sec
        this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

        this.scoreLimit = this.config.ultraRestartMassLimit;
        this.winner;

        // dsc
        server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        setInterval(()=>{
            server.sendChatMessage(null, null, 'discord.gg/xXcvpgJuJJ');
        }, 5 * 60000 * 3)
    };

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

    };

    checkScoreLimit(server) {
        for (var i = 0; i < server.clients.length; i++) {
            var client = server.clients[i];
            if (client == null) continue;

            var player = client.player;
            if (player.isRemoved)
                continue; // Don't add disconnected players to list

            var playerScore = player.getScore();

            if (!this.restarting &&
                playerScore / 100 > this.scoreLimit &&
                player.cells.length > 0) {
                this.startRestartTimer(server, player._name);
            }
        }
    };

    updateLB(server) {
        this.checkScoreLimit(server);
        FFA.prototype.updateLB(server); //call parent method
        
        if (this.restarting) {
            var lb = server.leaderboard;
            lb.length = 0; //hide nicknames
            var timeLeftLabel = "Restarting In " + this.downCounter-- + "s";
            lb.push(this.lb_add(timeLeftLabel));
            lb.push(this.lb_add(this.winner))
            lb.push(this.lb_add("Won The Game!"))
        }
    };

    lb_add(str) {
        return {
            getNameUnicode: function () {
                return stringToBytes(str);
            }
        }
    };
}

module.exports = Ultra;