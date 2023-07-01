const FFA = require('./FFA');
const GamePhase = require('../enum/GamePhaseEnum');

class Wager extends FFA {
    constructor() {
        super();
        this.ID = 2;
        this.name = "Wager";
        this.IsTournament = true;
        this.canRemergeLimit = 200;
        this.newPlayerCellBoostValue = 410;

        this.baseSpawnPoints = [{
            x: 6000,
            y: 0,
            color: {
                r: 252,
                g: 3,
                b: 3
            }
        }, {
            x: -6000,
            y: 0,
            color: {
                r: 36,
                g: 3,
                b: 252
            }
        }
        ];

        this.contenders = [];
        this.maxContenders = 2;

        this.timer = 0;
        this.winner;
        this.server;

        // Load Config
        this.config = require('../Settings.js');
    }

    onServerInit(server) {
        this.config.serverWelcome1 = "Connected to " + server.room.roomID;
        this.server = server;

        // Remove all cells
        var len = server.nodes.length;
        for (var i = 0; i < len; i++) {
            var node = server.nodes[0];

            if (!node) {
                continue;
            }

            server.removeNode(node);
        }

        server.bots.loadNames();

        // Pauses the server
        server.run = false;
        this.gamePhase = GamePhase.WAITING_FOR_PLAYERS;

        // Handles disconnections
        this.dcTime = server.config.playerDisconnectTime;
        server.config.playerDisconnectTime = 0;

        // Time limit
        this.timeLimit = 3 * 60; // in seconds
        this.prepTime = 3;
        this.endTime = 5;
    }

    onPlayerSpawn(server, player) {
        if ((this.gamePhase == GamePhase.WAITING_FOR_PLAYERS) && (this.contenders.length < this.maxContenders)) {
            const base = this.baseSpawnPoints[this.contenders.length]; // spawn
            player.setColor(base.color);
            server.spawnPlayer(player, base);
            player.lastSplit = new Date().valueOf();
            this.contenders.push(player); // Add to contenders list

            if (this.contenders.length == this.maxContenders) {
                // Start the game once there is enough players
                this.startGamePrep(server);
            }
        }
    }

    getSpectate() {
        var index = Math.floor(Math.random() * this.contenders.length);
        this.rankOne = this.contenders[index];
    }

    onPlayerDeath(server, players) {
        this.time = this.endTime;
        this.endGame();
    }

    updateLB(server, lb) {
        server.leaderboardType = 48;

        switch (this.gamePhase) {
            case GamePhase.PREPARE_TO_START: {
                lb[0] = "Game starting in";
                lb[1] = this.timer.toString();
                lb[2] = "Good luck!";
                if (this.timer <= 0) {
                    // Reset the game
                    this.startGame(server);
                } else {
                    this.timer--;
                }
                break;
            }
            case GamePhase.GAME_IN_PROGRESS: {
                lb[0] = "Time left:";
                lb[1] = this.formatTime(this.timeLimit);
                if (this.timeLimit < 0) {
                    this.endGameTimeout(server);
                } else {
                    this.timeLimit--;
                }
                break;
            }
            case GamePhase.END_GAME: {
                server.run = true;
                lb[0] = "Congratulations";
                lb[1] = this.winner?._name.split("$")[0] || "An Unnamed Cell";
                lb[2] = "for winning!";
                if (this.timer <= 0) {
                    // Reset the game
                    server.close();
                } else {
                    lb[3] = "Game restarting in";
                    lb[4] = this.timer.toString();
                    this.timer--;
                }
                break;
            }
            case GamePhase.END_GAME_TIMEOUT: {
                lb[0] = "Time Limit";
                lb[1] = "Reached!";
                if (this.timer <= 0) {
                    // Reset the game
                    server.close();
                } else {
                    lb[2] = "Game restarting in";
                    lb[3] = this.timer.toString();
                    this.timer--;
                }
                break;
            }
            default: {
                lb[0] = "Waiting for";
                lb[1] = "players: ";
                lb[2] = this.contenders.length + "/" + this.maxContenders;
                break;
            }
        }
    }

    formatTime = function (time) {
        if (time < 0) {
            return "0:00";
        }
        // Format
        var min = Math.floor(time / 60);
        var sec = time % 60;
        sec = (sec > 9) ? sec : "0" + sec.toString();
        return min + ":" + sec;
    }

    onCellRemove = function (cell) {
        var owner = cell.owner;
        var human_just_died = false;

        if (owner.cells.length <= 0) {
            // Remove from contenders list
            var index = this.contenders.indexOf(owner);
            if (index != -1) {
                if ('_socket' in this.contenders[index].socket) {
                    human_just_died = true;
                }
                if (this.gamePhase == GamePhase.WAITING_FOR_PLAYERS) {
                    this.contenders.splice(index, 1);
                }
                if (this.teamPlayers) {
                    var index = this.teamPlayers[owner.team].indexOf(owner);
                    if (index != -1 && owner.pos) {
                        owner.pos.free = true;
                        this.teamPlayers[owner.team].splice(index, 1)
                    }
                }
            }

            // Victory conditions
            var humans = 0;
            for (var i = 0; i < this.contenders.length; i++) {
                if ('_socket' in this.contenders[i].socket) {
                    humans++;
                }
            }

            // the game is over if:
            // 1) there is only 1 player left, OR
            // 2) all the humans are dead, OR
            // 3) the last-but-one human just died
            if ((this.contenders.length == 1 || humans == 0 || (humans == 1 && human_just_died)) && this.gamePhase == GamePhase.GAME_IN_PROGRESS) {
                //comment this to let normal play with bots
                this.endGame(cell.owner.gameServer);
            } else {
                // Do stuff
                this.onPlayerDeath(cell.owner);
            }
        }
    }

    onClientSocketClose(server, socket) {
        var name = socket.player._name.split("$")[0];

        if (name.length > 0) {
            server.sendChatMessage(null, null, name + " left the game");
        }
    }

    startGame(server) {
        this.server.run = true;
        this.gamePhase = GamePhase.GAME_IN_PROGRESS;
        this.getSpectate(); // Gets a random person to spectate
        this.server.config.playerDisconnectTime = this.dcTime; // Reset config
        this.resetLastSplit();
    }

    startGamePrep(server) {
        this.gamePhase = GamePhase.PREPARE_TO_START;
        this.timer = this.prepTime; // 10 seconds
    }

    endGameTimeout(server) {
        this.server.run = false;
        this.gamePhase = GamePhase.END_GAME_TIMEOUT;
        this.timer = this.endTime;
    }

    endGame() {
        this.winner = this.contenders[0];
        this.gamePhase = GamePhase.END_GAME;
        this.timer = this.endTime;
        if (!this.winner) {
            // Everyone left the game
            this.server.close();
        }
    }

    // 5 seconds recude rule mechanics
    onCellAdd(cell) {
        cell.owner.lastSplit = new Date().valueOf();
    }

    onTick(server) {
        this.contenders.forEach(contender => {
            if (GamePhase.GAME_IN_PROGRESS && new Date().valueOf() - contender.lastSplit > 5e3) {
                if (contender.cells.length <= 0) return;
                for (var i in contender.cells) {
                    contender.cells[i].setSize(contender.cells[i].getSize() * .825);
                }
                contender.lastSplit = new Date().valueOf();
            }
        })
    }

    resetLastSplit() {
        this.contenders.forEach(contender => contender.lastSplit = new Date().valueOf());
    }
}

module.exports = Wager;