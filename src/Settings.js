module.exports = Object.seal({
// MultiOgar configurations file
// Lines starting with // are comments

// [NOTE]
// MultiOgar uses cell size instead of cell mass to improve performance!
// In order to get the cell size from mass value, you need to calculate using this formula:
//     size = SQRT( mass * 100 )

// For example, to set start mass = 43:
//     size = SQRT( 43 * 100 ) = SQRT( 4300 ) = 65.57
// Set playerStartSize = 66

// Also, you can use the following syntax to specify mass:
//     playerStartSize = massToSize(43)
// It will be automatically converted to 66

// [Log]
// logVerbosity: Console log level (0=NONE; 1=FATAL; 2=ERROR; 3=WARN; 4=INFO; 5=DEBUG)
// logFileVerbosity: File log level
"logVerbosity": 4,
"logFileVerbosity": 5,

// [Server]
// serverTimeout: Seconds to keep connection alive for non-responding client
// serverWsModule: WebSocket module: 'ws' or 'uws' (install npm package before using uws)
// serverIpLimit: Controls the maximum connections from single IP (use 0 to disable)
// serverMinionIgnoreTime: minion detection disable time on server startup [seconds]
// serverMinionThreshold: max connections within serverMinionInterval time period, which will not be marked as minion
// serverMinionInterval: minion detection interval [milliseconds]
// serverPort: Server port which will be used to listen for incoming connections
// serverBind: Server network interface which will be used to listen for incoming connections (0.0.0.0 for all IPv4 interfaces)
// serverTracker: Set to 1 if you want to show your server on the tracker http://ogar.mivabe.nl/master (check that your server port is opened for external connections before setting it to 1)
// serverGamemode: 0 = FFA, 1 = Ultra
// serverBots: Number of player bots to spawn (Experimental)
// serverViewBase: Base view distance of players. Warning: high values may cause lag! Min value is 1920x1080
// serverMinScale: Min scale for player (low value leads to lags due to large visible area for big cell)
// serverSpectatorScale: Scale (field of view) used for free roam spectators (low value leads to lags, vanilla=0.4, old vanilla=0.25)
// serverStatsPort: Port for the stats server. Having a negative number will disable the stats server.
// serverStatsUpdate: Update interval of server stats in seconds
// serverScrambleLevel: Toggles scrambling of coordinates. 0 = No scrambling, 1 = lightweight scrambling. 2 = full scrambling (also known as scramble minimap), 3 - high level scrambling (no border)
// serverMaxLB: Controls the maximum players displayed on the leaderboard.
// serverChat: Allows the usage of server chat. 0 = no chat, 1 = use chat.
// serverName: Server name, for example "My great server"
// serverWelcome1: First server welcome message
// serverWelcome2: Second server welcome message (optional, for info, etc)
"serverVersionCode": 4,
"serverTimeout": 900,
"serverWsModule": "ws",
"serverMaxConnections": 120,
"serverIpLimit": 0,
"serverMinionIgnoreTime": 30,
"serverMinionThreshold": 10,
"serverMinionInterval": 1000,
"serverPort": 7251,
"serverBind": "0.0.0.0",
"serverTracker": 0,
"serverGamemode": 1,
"serverBots": 3,
"serverViewBaseX": 3072,
"serverViewBaseY": 1296,
"serverMinScale": 0.000001,
"serverSpectatorScale": 0.35,
"serverStatsPort": 8888,
"serverStatsUpdate": 1,
"serverScrambleLevel": 0,
"serverMaxLB": 10,
"serverChat": 1,
"serverChatAscii": 0,
"separateChatForTeams": 1,
"serverName": "Ultrasplit",
"serverWelcome1": "Connected to Ultrasplit",
"serverWelcome2": "First to get 220k wins!",
"restartMessage": "Server restarting...",

// [Border]
// Border size (vanilla 14142.135623730952)
"borderWidth": 16142,
"borderHeight": 16142,

// [Spawn]
// Each interval is 1 tick (40 ms)
// foodMinSize: vanilla 10 (mass = 10*10/100 = 1)
// foodMaxSize: vanilla 20 (mass = 20*20/100 = 4)
"foodMinSize": 10,
"foodMaxSize": 20,
"foodMinAmount": 1000,
"foodMaxAmount": 1500,
"foodSpawnAmount": 59.16079783,
"foodMassGrow": 1,
"spawnInterval": 15,

// virusMinSize: vanilla 100 (mass = 100*100/100 = 100)
// virusMaxSize: vanilla 140 (mass = 140*140/100 = 196)
"virusMinSize": 100,
"virusMaxSize": 141.421356237,
"virusMinAmount": 0,
"virusMaxAmount": 3,

// [Ejected Mass]
// ejectSize: vanilla 37 (mass = 37*37/100 = 13.69)
// ejectSizeLoss: Eject size which will be substracted from player cell (vanilla 43?)
// ejectDistance: vanilla 780
// ejectCooldown: Tick count until a player can eject mass again (1 tick = 40 ms)
// ejectSpawnPlayer: if 1 then player may be spawned from ejected mass
"ejectSize": 52.06,
"ejectSizeLoss": 52.43,
"ejectDistance": 880,
"ejectCooldown": 0,
"ejectSpawnPlayer": 0,

// [Player]
// Reminder: MultiOgar uses cell size instead of mass!
//       playerStartMass replaced with playerStartSize

// playerMinSize: vanilla 32 (mass = 32*32/100 = 10.24)
// playerMaxSize: vanilla 1500 (mass = 1500*1500/100 = 22500)
// playerMinSplitSize: vanilla 60 (mass = 60*60/100 = 36)
// playerStartSize: Start size of the player cell (mass = 64*64/100 = 41)
// playerSpeed: Player speed multiplier (1=normal speed, 2=twice faster)
// playerRecombineTime: Base time in seconds before a cell is allowed to recombine
// playerDecayRate: Amount of size lost per second
// playerDisconnectTime: Time in seconds before a disconnected player's cell is removed (Set to -1 to never remove)
"playerMinSize": 31.6227766017,
"playerMaxSize": 15000000,
"playerMinSplitSize": 59.16079783,
"playerStartSize": 150,
"playerMaxCells": 128,
"playerSpeed": 1,
"playerDecayRate": 0,
"playerRecombineTime": 0,
"playerMaxNickLength": 15,
"playerDisconnectTime": 0,
// "playerProtection": 0,

// [Gamemode]
// Alvariithoo was here!
// ultraRestartMassLimit: Mass limit for restarting server!
// ultraRestartCounterDuration: seconds left for resatrt!
// playerSplitDelay: Next Auto Split In Milliseconds for (Double, tripe, x16, etc.)
// playerMergeType: 0 = Ultrasplit | 1 = Instant | 2 = Normal
// chatCooldown: Next msg in Milliseconds
"ultraRestartMassLimit": 220000,
"ultraRestartCounterDuration": 25,
"playerSplitDelay": 40,
"playerMergeType": 0,
"chatCooldown": 25 * 2,

})