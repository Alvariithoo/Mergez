window.nameCache = {};

var config = {
    position: {
        top: -0.6,
        middle: 0,
        bottom: 0.6
    },

    animationDelay: 140,
    HatOpcity: 1,
    TextPost: 'middle',
};

/* Load skin spikes nodes */
var vr = new Image();
vr.src = "./images/vr.png";
var vg = new Image();
vg.src = "./images/vg.png";
var pepe = new Image();
pepe.src = "./images/pepe.png";
var pelletCanvas = document.createElement("canvas");
pelletCanvas.width = 22;
pelletCanvas.height = 22;
var pelletCtx = pelletCanvas.getContext("2d");
pelletCtx.beginPath();
pelletCtx.arc(11, 11, 15, 0, 2 * Math.PI);
pelletCtx.fillStyle = "#651fff";
// pelletCtx.fill();
var cellCanvas = document.createElement("canvas");
cellCanvas.width = 1000;
cellCanvas.height = 1000;
var cellCtx = pelletCanvas.getContext("2d");
cellCtx.beginPath();
cellCtx.arc(500, 500, 400, 0, 2 * Math.PI);
cellCtx.fillStyle = "#651fff";
// cellCtx.fill();
var W = 500;
var H = 500;
var mp = 50; //max particles
var particles = [];
for (var i = 0; i < mp; i++) {
    particles.push({
        x: Math.random() * W, //x-coordinate
        y: Math.random() * H, //y-coordinate
        r: Math.random() * 4 + 1, //radius
        d: Math.random() * mp //density
    })
}

function mainLoader() {
    if ((screen.width * screen.height) / 1000 < 1100) {
        document.body.style.zoom = "80%";
    }

    var child = $("#helloContainer");
    child.css("transform", "none");
    child.css("transform", "translate(-50%, -50%)");

    $(".icon-container").on("click", function () {
        $(".tab").removeClass("active");
        $("#" + this.attributes.href.value).addClass("active");
    });

    $("#input_box2").attr("placeholder", "Enter chat message...");
    $("#input_box2").attr("onkeydown", "getText();");

    $("#profile-main").prependTo("#home");
    $("#preview-img").attr("src", $("#skin_url").val());
    $("#skin_url").change(function() {
        $("#preview-img").attr("src", this.value);
    });

    $(".btn-green").insertBefore(".btn-blue");
    $(".btn-red").insertAfter(".btn-green");

    UI.getVersion = "V2.2.2";
    $("n2").text("Mergez.io | " + UI.getVersion + " | By Alvariithoo & Mrozio");

    $('#profile-bg').click(function() {
        while (localStorage.getItem("selected_profile") != 0) {
            $('.arrow-right').trigger('click');
        }
    });
    $('#profile-bg2').click(function() {
        while (localStorage.getItem("selected_profile") != 1) {
            $('.arrow-right').trigger('click');
        }
    });
    $('#profile-bg3').click(function() {
        while (localStorage.getItem("selected_profile") != 2) {
            $('.arrow-right').trigger('click');
        }
    });
    $('#profile-bg4').click(function() {
        while (localStorage.getItem("selected_profile") != 3) {
            $('.arrow-right').trigger('click');
        }
    });
    $('#profile-bg5').click(function() {
        while (localStorage.getItem("selected_profile") != 4) {
            $('.arrow-right').trigger('click');
        }
    });
    let time = 300;
    let element = [
        $(".ver-align"),
        $("#container")
    ];
    element[0].removeClass("opac0")
    setTimeout(() => {
        element[0].addClass("opac0");
        setTimeout(() => {
            element[1].removeClass("hided");
            setTimeout(() => {
                element[0].remove();
                element[1].removeClass("opac0")
            }, time / 2);
        }, time);
    }, time * 3);
}

function UI() {
    function enter() {
        return $("#nick").val(UI.getName()), nodeList[0][1] == UI.getName() ? false : (nodeList[0][1] = UI.getName(), setLocalStorage("nick", $("#nick").val()), player_profile[selected_profile].name = UI.getName(), data(), true);
    }

    function fillHSBFields() {
        var v = UI.getTeamName();
        return $("#team_name").val(v), tmpTeamname == v ? false : (setLocalStorage("opt_teamname", v), player_profile[selected_profile].team = v, data(), true);
    }

    function change() {
        setLocalStorage("selected_profile", selected_profile);
        tmpTeamname = UI.getTeamName();
        $("#nick").val(player_profile[selected_profile].name);
        $("#team_name").val(player_profile[selected_profile].team);
        $("#skin_url").val(player_profile[selected_profile].skinurl).trigger("change");
        if (fillHSBFields()) {
            nodeList[0][1] = UI.getName();
            setLocalStorage("nick", UI.getName());
        } else {
            enter();
        }
    }

    function data() {
        setLocalStorage("player_profile", player_profile);
    }
    var version = "v2.2.2";
    this.getVersion = function() {
        return version;
    };
    this.toggleKeys = function() {
        $("#KeysPanel").fadeToggle();
    };

    var log = {
        info: function(str) {
            console.debug("[INFO]", str);
        },
        warn: function(str) {
            console.warn("[WARN]", str);
        },
        err: function(str) {
            console.error("[ERROR] ", str);
        },
        debug: function(str) {
            console.info("[DEBUG] ", str);
        }
    };

    this.play = function() {
       setNick(document.getElementById("nick").value);
    };
    $.getJSON("http://49.12.231.126:3333/lbcolors" + (new Date()).getSeconds(), function(a) {
        window.tagColors = a.tagcolors;
    });

    this.noLag = false;
    this.isEnableHideFood = false;
    this.isEnableBorder = false;
    this.isEnableMapGrid = false;
    this.isEnableCursorLine = false;
    this.isEnableZoom = false;
    this.isStopMovement = false;
    this.isShowBallTotal = false;
    this.isShowSTE = false;
    this.isShowScroll = false;
    this.isEnableGridline = false;
    this.isEnableShowAllMass = true;
    this.isEnableAutoStart = false;
    this.isEnableMouseW = false;
    this.isEnableCustomSkin = true;
    this.isEnableHats = false;
    this.isEnableAttackRange = false;
    this.attackRangeRadius = 655;
    this.cellColor = "";
    this.split = this.doubleSplit = this.tripleSplit = this.quadSplit = this.autoW = false;
    this.doubleSplitCount = this.quadSplitCount = 0;
    this.lockZoomG;
    this.isEnableLockZoom = true;
    this.teammateIndicatorPosition = 40;
    this.teammateIndicatorSize = 500;
    this.teammateIndicatorShowSize = 1000000;
    this.teammateIndicator;
    this.isEnableTeammateIndicator = false;
    this.specTeammate = false;
    this.isSpecTeammate = false;
    this.isSpectating = false;
    this.isEnableSplitInd = false;
    this.isShowTextStrokeLine = false;
    this.isAutoHideName = true;
    this.isAutoHideMass = true;
    this.isTransparentCell = false;
    this.isShowFPS = true;
    //this.isShowPing = true;
    this.isEnableOtherSkinSupport = !false;
    this.isEnableBorder = true;
    this.isShowMass = true;
    this.isShowPacketIO = false;
    this.isHideSelfName = false;
    this.isRainbowFood = true;
    this.isEnabledLeaderboardColor = true;

    this.imageURL = null;
	this.imageCanvas = null;
	this.drawHats = () => {
		UI.imageURL = {
            '\x2a\x21': './path/hats/Alvarohd.png',
			'\x2a\x23': './path/hats/Crown.png',
            '\x2a\x2a': './path/hats/Fancy.png',
            '\x2a\x2b': './path/hats/Horns.png',
            '\x2a\x22': './path/hats/KK.png',
            '\x2a\x25': './path/hats/Kristo.png',
            '\x2a\x26': './path/hats/Ninja.png',
            '\x2a\x27': './path/hats/Pirate.png',
            '\x2a\x28': './path/hats/R2d2.png',
            '\x2a\x29': './path/hats/rolln.png',
            '\x2a\x2e': './path/hats/Santa.png',
            '\x2a\x2f': './path/hats/Troll.png'
		};

		UI.imageCanvas = {
            '\x2a\x21': null, // $*!
			'\x2a\x23': null, // $*#
            '\x2a\x2a': null, // $**
            '\x2a\x2b': null, // $*+
            '\x2a\x22': null, // $*"
            '\x2a\x25': null, // $*%
            '\x2a\x26': null, // $*&
            '\x2a\x27': null, // $*'
            '\x2a\x28': null, // $*(
            '\x2a\x29': null, // $*)
            '\x2a\x2e': null, // $*.
            '\x2a\x2f': null  // $*/
		};

		for (const property in UI.imageCanvas) {
			// console.log(property);
			if (UI.imageCanvas.hasOwnProperty(property)) {
				UI.imageCanvas[property] = new Image();
				UI.imageCanvas[property].src = UI.imageURL[property];
			}
		}
	};

    this.init = function() {
        mainLoader();
        $('body').append('<canvas id="canvas">');
        var c = document.getElementById("canvas");
        c.getContext("2d");
        c.mozOpaque = true;
        window.setLocalStorage = function(key, value) {
            if ("string" == typeof value) {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        };
        window.getLocalStorage = function(storageKey) {
            return localStorage.getItem(storageKey);
        };
        if (getLocalStorage("selected_profile")) {
            selected_profile = getLocalStorage("selected_profile");
        }
        if (getLocalStorage("player_profile")) {
            player_profile = JSON.parse(getLocalStorage("player_profile"));
        } else {
            if (getLocalStorage("nick")) {
                player_profile[selected_profile].name = getLocalStorage("nick");
            }
            if (getLocalStorage("opt_teamname")) {
                player_profile[selected_profile].team = getLocalStorage("opt_teamname");
            }
            if (getLocalStorage("skin_url")) {
                player_profile[selected_profile].skinurl = getLocalStorage("skin_url");
            }
        }
        c = 0;
        for (; c < player_profile.length; c++) {
            window.postMessage({
                data: player_profile[c].skinurl
            }, "*");
        }
        $("body").attr("oncontextmenu", "return false;");
        nodeList[0] = ["me", getLocalStorage("nick"), null, null, "yellow"];
        nodeList[1] = ["top1", "", null, null, "white"];
        nodeList[0][8] = Date.now();
        nodeList[1][8] = Date.now();
        chatRoom = new ChatRoom;
        chatRoom.setContainer("#overlays2");
        chatRoom.createChatBox();
        minimap = new Minimap;
        minimap.createMap(200);
        c = document.createElement("canvas");
        var context = c.getContext("2d");
        context.beginPath();
        context.lineWidth = 0;
        context.moveTo(0, 0);
        context.lineTo(100, 0);
        context.lineTo(50, 50);
        context.closePath();
        context.strokeStyle = "white";
        context.fillStyle = "white";
        context.stroke();
        context.fill();
        this.teammateIndicator = c;
        conn = new Connection;
        conn.connect();

        this.drawHats();
    };
    this.newGame = function() {
        $("#nick").prop("disabled", true);
        $(".btn-spectate").prop("disabled", true);
        $(".btn-spectate > i").replaceWith('<i class="material-icons">visibility_off</i>');
        isJoinedGame = true;
        UI.isStopMovement = false;
        UI.isSpectating = false;
        UI.cellColor = "";
        UI.newGameImpl();
        spectateMode = false;
        nodeList[1][2] = null;
        nodeList[1][3] = null;
    };
    this.afterGameLogicLoaded = function() {
        UI.setupOption();
        UI.setupHotKey();
        UI.restoreSetting();
        UI.setUpHotKeyConfigPage();
        UI.setupHints();
        UI.checkVersion();
        UI.downloadSkin();
        if (localStorage.getItem("xTestLeftMouse") && localStorage.getItem("xTestRightMouse")) {
            $("#rightMouse").val(localStorage.getItem("xTestRightMouse"));
            $("#leftMouse").val(localStorage.getItem("xTestLeftMouse"));
        } else console.log("Error saving mouse storage");
        $("#nick").change(function() {
            enter();
        });
        $("#team_name").change(function() {
            fillHSBFields();
        }).focus(function() {
            tmpTeamname = UI.getTeamName();
        });
        $("#skin_url").change(function() {
            var nv = getLocalStorage("skin_url");
            var v = UI.getCustomSkinUrl();
            $("#skin_url").val(v);
            if (nv != v) {
                nv = /^https?:\/\/(\w+\.)?imgur.com\/(\w*\d\w*)+(\.[a-zA-Z]{3})?$/g;
                if ("DEFAULT" == v || nv.test(v)) {
                    setLocalStorage("skin_url", v);
                    nodeList[0][5] = v;
                    player_profile[selected_profile].skinurl = UI.getCustomSkinUrl();
                    data();
                    if (customSkin[v]) {
                        UI.changePreviewImage(customSkin[v].src);
                    } else {
                        skinDownloadQueue.push(v);
                    }
                } else {
                    log.error("Not valid URL");
                    $('#preview-img').attr('src', './img/error.png');
                    swal({
                        title: 'Not Valid URL',
                        text: 'Try again with another link...',
                        type: "warning",
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            }
        });
        $(".nav2.arrow-left").click(function() {
            selected_profile = (player_profile.length + selected_profile - 1) % player_profile.length;
            change();
        });
        $(".nav2.arrow-right").click(function() {
            selected_profile = (selected_profile + 1) % player_profile.length;
            change();
        });
        data();
    };
    this.spectate = function(buffer2) {
        conn.joinRoom(UI.getRoom());
        if (!(buffer2 && 0 != buffer2.length)) {
            UI.isSpectating = true;
        }
    };
    this.newGameImpl = function() {
        var e = true;
        var sectors = getCell();
        if (!(sectors && 0 != sectors.length)) {
            e = false;
        }
        if (e) {
            nodeList[0][6] = sectors[0].color;
            conn.joinRoom(UI.getRoom());
        } else {
            setTimeout(UI.newGameImpl, 100);
        }
    };
    this.onDead = function() {
        isJoinedGame = false;
        $(".btn-spectate").prop("disabled", false);
        $(".btn-spectate > i").replaceWith('<i id="icon" class="material-icons">visibility</i>');
        $("#nick").prop("disabled", false);
        $(".nav").show();
        conn.leaveRoom(UI.getRoom());
    };
    this.afterGameLoaded = function() {
        UI.isSpectating = false;
        updateLBCount = -1;
        $("#nick").prop("disabled", false);
        $("#ip_info").text("Server: " + $("#chooseServer option:selected").text());
        setInterval(function() {
            var startTime;
            $.ajax({
                beforeSend: function(xhr) {
                    startTime = +new Date();
                },
                complete: function(xhr, state) {
                    var latency = (new Date()) - startTime;
                    $("#latency_info").text("Latency: " + latency);
                }
            });
        }, 1500);
        moveTo(null, null);
        UI.specTeammate = null;
        UI.isStopMovement = false;
        minimap.setDeadPosition(null);
        conn.joinRoom(UI.getRoom());
    };
    this.getRoom = function() {
        return "N/A" == UI.getCurrentPartyCode() ? UI.getTeamName() + UI.getCurrentIP() : UI.getTeamName() + UI.getCurrentPartyCode();
    };
    this.restoreSetting = function() {
        if (getLocalStorage("opt_teamname")) {
            $("#team_name").val(getLocalStorage("opt_teamname"));
        }
        if (getLocalStorage("nick") && "" != getLocalStorage("nick").trim()) {
            $("#nick").val(getLocalStorage("nick", UI.getName()));
        } else {
            $("#nick").val(UI.getName());
            setLocalStorage("nick", UI.getName());
        }
        nodeList[0][1] = UI.getName();

        if (getLocalStorage("animDelay")) {
            config.animationDelay = getLocalStorage("animDelay");
            $("#animDelay").val(config.animationDelay);
            $("#anim_delay_txt").text(config.animationDelay);
        }
        if (getLocalStorage("HatsOpacty")) {
            config.HatOpcity = getLocalStorage("HatsOpacty");
            $("#HatsOpacty").val(config.HatOpcity);
            $("#hats_txt").text(config.HatOpcity);
        }

        var n = getLocalStorage("skin_url");
        if (n && "" != n || (setLocalStorage("skin_url", defaultSkin), n = defaultSkin), n && ("" != n && ($("#skin_url").val(getLocalStorage("skin_url")), nodeList[0][5] = n, customSkin[n] ? UI.changePreviewImage(customSkin[n].src) : skinDownloadQueue.push(getLocalStorage("skin_url")))), getLocalStorage("hotkeyMapping")) {
            hotkeyMapping = JSON.parse(getLocalStorage("hotkeyMapping"));
        } else {
            var unlock;
            for (unlock in hotkeyConfig) {
                if (hotkeyConfig[unlock].defaultHotkey) {
                    if ("" != hotkeyConfig[unlock].defaultHotkey) {
                        hotkeyMapping[hotkeyConfig[unlock].defaultHotkey] = unlock;
                    }
                }
            }
            setLocalStorage("hotkeyMapping", hotkeyMapping);
        }
        if (getLocalStorage("chatCommand")) {
            chatCommand = JSON.parse(getLocalStorage("chatCommand"));
        }
    };
    this.setupOption = function() {
        var options = {
            opt_noLag: {
                text: "No Lag",
                "default": false,
                handler: function (token) {
                    UI.noLag = token;
                }
            },
            opt_self_name: {
                text: "Hide my name",
                "default": true,
                handler: function(token) {
                    UI.isHideSelfName = token;
                }
            },
            opt_name: {
                text: "Hide Names",
                handler: function(token) {
                    setNames(!token);
                }
            },
            opt_mass: {
                text: "Show mass",
                "default": true,
                handler: function(token) {
                    setShowMass(token);
                }
            },
            opt_massinks: {
                text: "Mass In Ks",
                "default": true,
                handler: function(token) {
                    UI.massInKs = token;
                }
            },
            opt_chatbox: {
                text: "Chat",
                "default": true,
                handler: function(token) {
                    if (token) {
                        chatRoom.show();
                    } else {
                        chatRoom.hide();
                    }
                }
            },
            opt_gridline: {
                text: 'Gridlines',
                "default": false,
                handler(token) {
                    UI.isEnableGridline = token;
                }
            },
            opt_mapgrid: {
                text: "Grid Locations",
                "default": false,
                handler: function(token) {
                    UI.isEnableMapGrid = token;
                }
            },
            "opt_border": {
                text: "Map Border",
                default: true,
                handler: function(token) {
                    UI.isEnableBorder = token;
                }
            },
            opt_current_Mass: {
                text: "Mass",
                "default": true,
                handler: function(token) {
                    UI.isShowMass = token;
                }
            },
            opt_ping: {
                text: "Ping",
                "default": true,
                handler: function(token) {
                    UI.isShowPing = token;
                },disabled: true
            },
            opt_score: {
                text: "Score",
                "default": false,
                handler: function(token) {
                    UI.isShowScroll = token;
                }
            },
            opt_minimap: {
                text: "Minimap",
                "default": false,
                handler: function(token) {
                    if (token) {
                        minimap.show();
                    } else {
                        minimap.hide();
                    }
                }
            },
            opt_custom_skin: {
                text: "Custom Skins",
                "default": true,
                handler: function(token) {
                    UI.isEnableCustomSkin = token;
                }
            },
            opt_hats: {
                text: "Hide Hats",
                handler: function (token) {
                    UI.isEnableHats = token;
                }
            },
            opt_mousew: {
                text: "Mouse Feed",
                handler: function(token) {
                    UI.isEnableMouseW = token;
                }
            },
            opt_teammate_indicator: {
                text: "Cell Indicator",
                "default": false,
                handler: function(token) {
                    UI.isEnableTeammateIndicator = token;
                }
            },
            opt_noskin: {
                text: "Hide Skin URL",
                disabled: false,
                "default": false,
                handler: function(token) {
                    if (token) {
                        $("#skin_url").css("cssText", "color: #fff!important");
                    } else {
                        $("#skin_url").css("cssText", "color: #000!important");
                    }
                }
            },
            opt_rainbowfood: {
                text: 'Rainbow Food',
                "default": true,
                handler(token) {
                    UI.isRainbowFood = token;
                }
            },
            opt_color: {
                text: "Hide blob colors",
                handler: function(token) {
                    setColors(token);
                }
            },
            opt_cursorline: {
                text: "Cursor Line",
                "default": false,
                handler: function(token) {
                    UI.isEnableCursorLine = token;
                }
            },
            opt_zoom: {
                text: "Zoom",
                "default": true,
                handler: function(token) {
                    UI.isEnableZoom = token;
                }
            },
            opt_food: {
                text: "Hide Pellets",
                handler: function(token) {
                    UI.isEnableHideFood = token;
                }
            },
            opt_ste: {
                text: "STE",
                "default": false,
                handler: function(token) {
                    UI.isShowSTE = token;
                }
            },
            opt_ball_total: {
                text: "[n/Blobs]",
                "default": false,
                handler: function(token) {
                    UI.isShowBallTotal = token;
                }
            },
            opt_fps: {
                text: "FPS",
                "default": true,
                handler: function(token) {
                    UI.isShowFPS = token;
                }
            },
            opt_packetIO: {
                text: "Packets I/O",
                "default": false,
                handler: function(token) {
                    UI.isShowPacketIO = token;
                }
            },
            opt_transparent_cell: {
                text: "Transparent Blobs",
                handler: function(token) {
                    UI.isTransparentCell = token;
                }
            },
            opt_auto_hide_mass: {
                text: "Auto Hide Mass",
                disabled: true,
                "default": true,
                handler: function(token) {
                    UI.isAutoHideMass = token;
                }
            },
            opt_auto_hide_name: {
                text: "Auto Hide Names",
                "default": true,
                handler: function(token) {
                    UI.isAutoHideName = token;
                },
                disabled: true
            },
            opt_lock_zoom: {
                text: "Auto Zoom",
                handler: function(token) {
                    UI.isEnableLockZoom = !token;
                }
            },
            opt_split_ind: {
                text: "Split Indicators",
                handler: function(token) {
                    UI.isEnableSplitInd = token;
                }
            },
            opt_show_text_stroke_line: {
                text: "Text Shadows",
                handler: function(token) {
                    UI.isShowTextStrokeLine = token;
                }
            }
        };
        window.setYinSkinSupport = function(firstRestricted) {
            options.opt_other_skin.handler(firstRestricted);
            setLocalStorage("opt_other_skin", firstRestricted);
        };
        var i;
        var row = [];
        for (i in options) {
            if (!options[i].disabled) {
                row.push(`<div class="setting-container">\n\t<p class="textSetting">${options[i]["text"]}</p>\n\t<input id="${i}" class="flip" type="checkbox"> \n\t<label class="setting" for="${i}"></label>\n</div>`);
            }
        }
        var d = row.splice(0, 15);
        var j = 0;
        for (; j < d.length; j++) {
            $(".firstSettings").append(d[j]);
        }
        j = 0;
        for (; j < row.length; j++) {
            $(".secondSettings").append(row[j]);
        }
        $("input:checkbox").change(function() {
            var firstRestricted = $(this).prop("checked");
            var type = $(this).prop("id");
            setLocalStorage(type, firstRestricted);
            if (options[type]) {
                options[type].handler(firstRestricted);
            }
        });
        for (i in options) {
            if (getLocalStorage(i)) {
                if ("true" == getLocalStorage(i)) {
                    if ("opt_other_skin" == i) {
                        setYinSkinSupport(!false);
                    } else {
                        $("#" + i).click();
                    }
                }
            } else {
                if (options[i]["default"]) {
                    $("#" + i).click();
                }
            }
        }

        $("#AnimationDelay").append(`Animation Delay: <span id="anim_delay_txt">${config.animationDelay}</span>\n</div>\n<input oninput="$(\'#anim_delay_txt\').text(this.value);" class="range-slider__range" style="width:100%;" type="range" id="animDelay" name="animDelay" min="40" max="240" step="10" value="${config.animationDelay}"></input>`);
        $("#animDelay").change(function() {
            config.animationDelay = $("#animDelay").val();
            setLocalStorage("animDelay", config.animationDelay);
        });
    
        $("#HatsCell").append(`Hats Opacity: <span id="hats_txt">${config.HatOpcity}</span>\n</div>\n<input oninput="$(\'#hats_txt\').text(this.value);" class="range-slider__range" style="width:100%;" type="range" id="HatsOpacty" name="HatsOpacty" min="0.5" max="1" step="0.05" value="${config.HatOpcity}"></input>`);
        $("#HatsOpacty").change(function() {
            config.HatOpcity = $("#HatsOpacty").val();
            setLocalStorage("HatsOpacty", config.HatOpcity);
        });
    };
    this.scoreInfo = function(millis) {
        if (!millis || !millis.length) {
            return "";
        }
        var optsData = "";
        return UI.isShowSTE && (optsData += "   STE: " + this.getSTE(millis)), UI.isShowBallTotal && (optsData += "   [" + millis.length + "/Blobs]"), optsData;
    };
    this.scoreTxt = function(dataAndEvents) {
        return UI.isShowScroll ? dataAndEvents : "";
    };
    this.isShowScoreInfo = function() {
        return UI.isShowScroll || (UI.isShowSTE || UI.isShowBallTotal);
    };
    this.getSTE = function(codeSegments) {
        var w = 0;
        var i = 0;
        for (; i < codeSegments.length; i++) {
            if (codeSegments[i]) {
                if (codeSegments[i].I) {
                    if (codeSegments[i].I.w) {
                        if (codeSegments[i].I.w > w) {
                            w = codeSegments[i].I.w;
                        }
                    }
                }
            }
        }
        return ~~(0.375 * w);
    };
    this.isPrivateServer = function() {
        return PRIVATE_SERVER_IP == currentIP;
    };
    this.getCurrentIP = function() {
        return this.isPrivateServer() ? "----------" : currentIP.substring(5, currentIP.length);
    };
    this.getTeamName = function() {
        return ("" == $("#team_name").val() ? "" : $("#team_name").val()).trim();
    };
    this.getCustomSkinUrl = function() {
        var ret = ($("#skin_url").val() + "").trim();
        return "" == ret ? "" : ret;
    };
    this.getCurrentPartyCode = function() {
        return currentIP;
    };
    this.getCurrentServer = function() {
        return currentIP
    };
    this.showMessage = function(message, options) {
        if (0 == $("#message_dialog").length) {
            UI.createMessageDialog();
        }
        $("#message_dialog_title").text(message);
        $("#message_dialog_content").html(options);
        $("#message_dialog").modal({
            show: "true"
        });
    };
    this.getName = function() {
        var val = $("#nick").val().trim();
        return -1 != val.indexOf("\u200b") && (val = ""), "" == val ? "" : val;
    };
    this.getLeaderBoard = function() {
        var listenersArr = [];
        var codeSegments = getLB();
        if (codeSegments) {
            var i = 0;
            for (; i < codeSegments.length; i++) {
                listenersArr[listenersArr.length] = "" == codeSegments[i].name.split('$')[0] ? "An unnamed cell" : escapeHtml(codeSegments[i].name.split('$')[0]);
            }
        }
        return listenersArr;
    };
    this.setupHotKey = function() {
        hotkeyConfig = {
            hk_start_new_game: {
                defaultHotkey: "N",
                name: "Respawn",
                keyDown: async function () {
                    await chatRoom.sendMessageToServer('/kill');
                    await $(".btn-play").trigger("click");
                },
                type: "NORMAL"
            },
            hk_send_noLag: {
                defaultHotkey: "",
                name: "No Lag",
                keyDown: function() {
                    $("#opt_noLag").click();
                },
                type: "NORMAL"
            },
            hk_cheatw: {
                defaultHotkey: "W",
                name: "Macro W",
                keyDown: function() {
                    UI.autoW = true;
                    handleQuickW();
                },
                keyUp: function() {
                    UI.autoW = false;
                },
                type: "NORMAL"
            },
            hk_double_Split: {
                defaultHotkey: "A",
                name: "Double Split",
                keyDown: function() {
                    if (!UI.doubleSplit) {
                        UI.doubleSplit = true;
                        doubleSplit();
                    }
                },
                keyUp: function() {
                    UI.doubleSplit = false;
                },
                type: "NORMAL"
            },
            hk_triple_Split: {
                defaultHotkey: "S",
                name: "Triple Split",
                keyDown: function() {
                    if (!UI.tripleSplit) {
                        UI.tripleSplit = true;
                        tripleSplit();
                    }
                },
                keyUp: function() {
                    UI.tripleSplit = false;
                },
                type: "NORMAL"
            },
            hk_quad_Split: {
                defaultHotkey: "D",
                name: "Quad Split",
                keyDown: function() {
                    if (!UI.quadSplit) {
                        UI.quadSplit = true;
                        quadSplit();
                    }
                },
                keyUp: function() {
                    UI.quadSplit = false;
                },
                type: "NORMAL"
            },
            hk_stop_movement_toggle: {
                defaultHotkey: "Z",
                name: "Stop movement (Toggle)",
                keyDown: function() {
                    UI.isStopMovement = !UI.isStopMovement;
                    UI.specTeammate = null;
                },
                type: "NORMAL"
            },
            k_custom_skin: {
                defaultHotkey: "",
                name: "On/off Custom skin",
                keyDown: function() {
                    $("#opt_custom_skin").click();
                },
                type: "NORMAL"
            },
            hk_skin: {
                defaultHotkey: "V",
                name: "Show/hide skins",
                keyDown: function() {
                    $("#opt_skin").click();
                },
                type: "NORMAL"
            },
            hk_name: {
                defaultHotkey: "N",
                name: "Show/hide names",
                keyDown: function() {
                    $("#opt_name").click();
                },
                type: "NORMAL"
            },
            hk_mass: {
                defaultHotkey: "M",
                name: "Show/hide mass",
                keyDown: function() {
                    $("#opt_mass").click();
                },
                type: "NORMAL"
            },
            hk_food: {
                defaultHotkey: "F",
                name: "Show/hide food",
                keyDown: function() {
                    $("#opt_food").click();
                },
                type: "NORMAL"
            },
            hk_split_ind: {
                defaultHotkey: "",
                name: "On/off split indicator",
                keyDown: function() {
                    $("#opt_split_ind").click();
                },
                type: "NORMAL"
            },
            hk_lock_zoom: {
                defaultHotkey: "",
                name: "On/off auto zoom",
                keyDown: function() {
                    $("#opt_lock_zoom").click();
                },
                type: "NORMAL"
            },
            "hk_pause": {
                defaultHotkey: "",
                name: "Pause game for short moment",
                keyDown: function() {
                    var pause = (new Date).getTime();
                    for (; pause + 500 >= (new Date).getTime();) {}
                },
                type: "NORMAL"
            },
            hk_zoom_a: {
                defaultHotkey: "1",
                name: "Zoom level 1",
                keyDown: function() {
                    if (!UI.isEnableLockZoom) {
                        hotkeyConfig.hk_lock_zoom.keyDown();
                    }
                    setZoomLevel(0.75);
                },
                type: "NORMAL"
            },
            hk_zoom_b: {
                defaultHotkey: "2",
                name: "Zoom level 2",
                keyDown: function() {
                    if (!UI.isEnableLockZoom) {
                        hotkeyConfig.hk_lock_zoom.keyDown();
                    }
                    setZoomLevel(0.3);
                },
                type: "NORMAL"
            },
            hk_zoom_c: {
                defaultHotkey: "3",
                name: "Zoom level 3",
                keyDown: function() {
                    if (!UI.isEnableLockZoom) {
                        hotkeyConfig.hk_lock_zoom.keyDown();
                    }
                    setZoomLevel(0.15);
                },
                type: "NORMAL"
            },
            hk_zoom_d: {
                defaultHotkey: "4",
                name: "Zoom level 4",
                keyDown: function() {
                    if (!UI.isEnableLockZoom) {
                        hotkeyConfig.hk_lock_zoom.keyDown();
                    }
                    setZoomLevel(0.08);
                },
                type: "NORMAL"
            },
            hk_zoom_e: {
                defaultHotkey: "5",
                name: "Zoom level 5",
                keyDown: function() {
                    if (!UI.isEnableLockZoom) {
                        hotkeyConfig.hk_lock_zoom.keyDown();
                    }
                    setZoomLevel(0.05);
                },
                type: "NORMAL"
            },
            hk_send_msg: {
                defaultHotkey: "ENTER",
                name: "Chatbox send message",
                keyDown: function() {
                    chatRoom.enter();
                },
                type: "NORMAL"
            },
        };
    };
    this.createMessageDialog = function() {
        var $message;
        var $text;
        $text = $("<div class='modal-footer'>");
        $text.append("<button type='button' class='btn btn-default' data-dismiss='modal'>OK</button>");
        $message = $("<div class='modal-content'/>");
        $message.append($("<div class='modal-header'/>").append("<button type='button' class='close' data-dismiss='modal'>&times;</button><h4 id='message_dialog_title' class='modal-title'></h4>"));
        $message.append($("<div id='message_dialog_content' class='modal-body'>"));
        $message.append($text);
        $message = $("<div id='message_dialog' class='modal fade' role='dialog'/>").append("<div class='modal-dialog'/>").append($message);
        $("body").append($message);
        $("#message_dialog").modal({
            backdrop: "static",
            keyboard: false
        });
        $(document).on("shown.bs.modal", "#message_dialog", function() {
            var a = $("#message_dialog>.modal-content").outerHeight();
            var b = $(document).outerHeight();
            if (a > b) {
                $("#message_dialog").css("overflow", "auto");
            } else {
                $("#message_dialog").css("margin-top", b / 2 - a / 2 - 40);
            }
        });
        $(document).on("hide.bs.modal", "#message_dialog", function() {});
    };
    this.setUpHotKeyConfigPage = function () {
        var body;
        body = $('<div class="modal-content"/>');
        body.append($('<div id="hotkey_modal_body" class="modal-body">').append(UI.getHotkeyDivHtml()));
        body = $('<div id="hotkeys_setting" class="modal fade" role="dialog"/>').append(body);
        $("#Keys-Container").append(body);
        $("#hotkey_setting").insertAfter(".modal-content")
        $(document).on("hide.bs.modal", "#hotkeys_setting", function () {
            if (selectedHotkeyRow) {
                selectedHotkeyRow.removeClass("table-row-selected");
            }
            selectedHotkeyRow = null;
            Game.refreshHotkeySettingPage();
        });
        $("#hotkey_table .row").not(".header").click(function () {
            if (selectedHotkeyRow) {
                selectedHotkeyRow.removeClass("table-row-selected");
            }
            selectedHotkeyRow = $(this);
            selectedHotkeyRow.addClass("table-row-selected");
        });
    };
    window.saveHotkeys = function() {
        var codeSegments = $(".hotkey");
        hotkeyMapping = {};
        var i = 0;
        for (; i < codeSegments.length; i++) {
            hotkeyMapping[$(codeSegments[i]).text()] = $(codeSegments[i]).attr("data-hotkeyid");
        }
        setLocalStorage("hotkeyMapping", hotkeyMapping);
        var guid;
        for (guid in chatCommand) {
            chatCommand[guid] = $("#" + guid).val();
        }
        setLocalStorage("chatCommand", chatCommand);
        localStorage.setItem("xTestRightMouse", $("#rightMouse").val());
        localStorage.setItem("xTestLeftMouse", $("#leftMouse").val());
    };
    this.copyGameInfo = function() {
        var failuresLink;
        failuresLink = "Current IP = " + UI.getCurrentIP();
        var codeSegments = UI.getLeaderBoard();
        if (codeSegments && 0 != codeSegments.length) {
            var i = 0;
            for (; i < codeSegments.length; i++) {
                failuresLink += "\n" + (i + 1) + ".  " + codeSegments[i];
            }
        }
        copyToClipboard(failuresLink);
    };
    window.resetDefaultHotkey = function() {
        var e;
        e = hotkeyMapping;
        defaultHotkeyMapping = {};
        var unlock;
        for (unlock in hotkeyConfig) {
            if (hotkeyConfig[unlock].defaultHotkey) {
                if ("" != hotkeyConfig[unlock].defaultHotkey) {
                    defaultHotkeyMapping[hotkeyConfig[unlock].defaultHotkey] = unlock;
                }
            }
        }
        hotkeyMapping = defaultHotkeyMapping;
        UI.refreshHotkeySettingPage();
        hotkeyMapping = e;
        defaultHotkeyMapping = null;
    };
    this.refreshHotkeySettingPage = function() {
        var codeSegments = $(".hotkey");
        var i = 0;
        for (; i < codeSegments.length; i++) {
            $(codeSegments[i]).text(" ");
        }
        var version;
        for (version in hotkeyMapping) {
            $("[data-hotkeyid=" + hotkeyMapping[version] + "]").text(version);
        }
        var val;
        for (val in chatCommand) {
            $("#" + val).val(chatCommand[val]);
        }
    };
    this.getHotkeyDivHtml = function () {
        var html = "";
        var fragment = $("<div id='hotkey_setting'></div>");
        var rendered = $("<div id='hotkey_table'></div>");
        var $message = $("<div class='row'></div>");
        $message.append($("<div class='cell cell1' style='background:rgba(137, 24, 24, 0.69)'>Hotkey</div>"));
        $message.append($("<div class='cell cell2' style='background:rgba(137, 24, 24, 0.69)'>Function</div>"));
        $message.append($("<div class='cell cell3' style='background:rgba(137, 24, 24, 0.69)'>Message</div>"));
        rendered.append($message);
        $message = null;
        var type;
        for (type in hotkeyConfig) {
            $message = $("<div class='row'></div>");
            $message.append($(`<div data-hotkeyId='${type}' class='cell1 hotkey'>${getHotkeyById(type)}</div>`));
            $message.append($(`<div class='cell cell2'>${hotkeyConfig[type].name}</div>`));
            if ("TEXT" == hotkeyConfig[type].type) {
                $message.append($(`<div class='cell cell'><input id='input_${type}' class='input-hk' maxlength='200' type='text' value='${chatCommand["input_" + type]}'></input></div>`));
            } else {
                $message.append($("<div class='cell cell3'> / </div>"));
            }
            rendered.append($message);
        }
        return fragment.append(rendered),
        html += $("<h1>Keysbinds Setup</h1>")[0].outerHTML,
        html += $("<hr id='server-hr'>")[0].outerHTML,
        html += $("<p class='ins-text'>Step 1: Click on the function item</p>")[0].outerHTML,
        html += $("<p class='ins-text'>Step 2: Press wanted hotkey to modify</p>")[0].outerHTML,
        html += $("<p class='ins-text'>Press [DEL] key to remove selected hotkey</p>")[0].outerHTML,
        // html += $("<br></br>")[0].outerHTML,
        html += $("<hr id='server-hr'>")[0].outerHTML,
        html += $("<p class='ins-text'>Allowed hotkey combinations:</p>")[0].outerHTML,
        html += $("<p class='ins-text'>[CTRL] + [ALT] + 0-9, a-z, [TAB], [ENTER]</p>")[0].outerHTML,
        html += $("<br></br>")[0].outerHTML,
        html += $(`
        <div style="width: 40%;float: left;font-size: 15px;margin-top: 15px;margin-right: 15px;margin-left: 10px;">
            <span>Left Mouse</span>
            <select id="leftMouse" class="mouse-select">
                <option disabled>Left Mouse</option>
                <option id="leftMouseDefault">None</option>
                <option value="Feed">Macro Feed</option>
                <option value="Split16">Quad Split</option>
                <option value="Split8">Triple Split</option>
                <option value="Split4">Double Split</option>
                <option value="Split">Split</option>
            </select>
        </div>
        `)[0].outerHTML,
        html += $(`
        <div style="float: left;width: 40%;margin: 15px;font-size: 15px;">
            <span>Right Mouse</span>
            <select id="rightMouse" class="mouse-select">
                <option disabled>Right Mouse</option>
                <option id="rightMouseDefault">None</option>
                <option value="Feed">Macro Feed</option>
                <option value="Split16">Quad Split</option>
                <option value="Split8">Triple Split</option>
                <option value="Split4">Double Split</option>
                <option value="Split">Split</option>
            </select>
        </div>
        `)[0].outerHTML,
        html += $('<button id="reset">Reset</button>')[0].outerHTML,
        html += $('<button id="save">Save</button>')[0].outerHTML,
        html += $("<br></br>")[0].outerHTML,
        html += fragment[0].outerHTML,
        $("<div/>").append(html).html();
    };
    this.checkVersion = function() {
        var string = getLocalStorage("lastestVersion");
        if (!(string && string == UI.version)) {
            UI.applyNewUpdate();
            setLocalStorage("lastestVersion", UI.version);
        }
    };
    this.showAnnouncement = function() {};
    this.applyNewUpdate = function() {};
    this.setupHints = function() {};
    this.setupHintsImpl = function(node, newValue) {
        node.addClass("hint--bottom hint--rounded");
        node.attr("data-hint", newValue);
    };
    this.ajax = function(url, options, callback, uri) {
        uri = null;
        var request;
        try {
            request = new XMLHttpRequest;
        } catch (a) {
            try {
                request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (s) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (l) {
                    return alert("Your browser does not support Ajax."), false;
                }
            }
        }
        return request.onreadystatechange = function() {
            if (4 == request.readyState) {
                callback(request);
            }
        }, request.open(options, url, true), request.send(uri), request;
    };
    this.getSkinImage = function(t) {
        return t && "" != t ? customSkin[t] ? customSkin[t] : (-1 == skinDownloadQueue.indexOf(t) && skinDownloadQueue.push(t), null) : null;
    };
    this.downloadSkin = function() {
        if (0 != skinDownloadQueue.length) {
            var task = skinDownloadQueue.shift();
            if (!customSkin[task]) {
                if (skinDownloadFail[task] && 5 < skinDownloadFail[task]) {
                    if (UI.getCustomSkinUrl() === task) {
                        $("#skin_url").val("").trigger("change");
                    }
                } else {
                    window.postMessage({
                        data: task
                    }, "*");
                }
            }
        }
        setTimeout(UI.downloadSkin, 2E3);
    };
    this.changePreviewImage = function(url) {
        $("#preview-img").fadeOut(315, function() {
            $(this).attr("src", url).bind("onreadystatechange load", function() {
                if (this.complete) {
                    $(this).fadeIn(315);
                }
            });
        });
    };
}

window.exec = function(command) {
    chatRoom.sendMessageToServer(command);
}

/*****************************/

function ChatRoom() {
    this.container = '';
    this.isShow = true;
    this.lastMsg = '';
    this.width = 340;
    this.height = 350;
    const _this = this;
    let t = 0;

    this.createChatBox = function() {
        $(this.container).append("<div id='chatroom'></div>");
        this.hide();
        $("#chatboxArea2").hide();
        $("#chatroom").mouseup(function() {
            _this.resize();
        });
    };
    _this.resize = function() {
        if ($('#chatroom').width() != this.width || $('#chatroom').height() != this.height) {
            if ($('#chatroom').perfectScrollbar) {
                $('#chatroom').perfectScrollbar('update');
            }
        }
    };
    this.setContainer = function(container) {
        this.container = container;
    };
    this.sendMessageToServer = message => {
        message = message.trim();
        if ((message.length < 200) && (message.length > 0)) {
            var view = new DataView(new ArrayBuffer(2 + 2 * message.length));
            var offset = 0;
            view.setUint8(offset++, 99);
            view.setUint8(offset++, 0);
            for (var i = 0; i < message.length; ++i) {
                view.setUint16(offset, message.charCodeAt(i), true);
                offset += 2
            };
            window.webSocket.send(view)
        }
    };
    this.sendMessage = function(message) {
        this.sendMessageToServer(message);
        // if (message.charAt(0) == '/') { // Comando para el servidor
        //     window.exec(message);
        // } else {
        //     if (message = message.trim()) {
        //         if (!(2E3 > Date.now() - t && 50 > message.length)) {
        //             conn.sendMessage({
        //                 sender: UI.getName(),
        //                 team: UI.getTeamName(),
        //                 message: message,
        //                 skinUrl: UI.getCustomSkinUrl()
        //             });
        //             this.lastMsg = message;
        //             t = Date.now();
        //         }
        //     }
        // }
    };
    this.enter = function() {
        if (this.isFocus()) {
            this.sendMessage($("#input_box2").val());
            $("#input_box2").val("");
            $("#input_box2").blur();
            $("#chatboxArea2").hide();
        } else {
            this.focus();
        }
    };
    this.getTimeStr = function() {
        var now = new Date;
        var index = now.getMinutes();
        return index = 10 > index ? "0" + index : index, now.getHours() + ":" + index + " ";
    };
    this.receiveMessage = function(role, name, message, color) {
        $("#chatroom").append(`
            <div class="chatItem">
                <span id="time">${this.getTimeStr()} 
                <span class="chatHolder" style="color:${color}">${role}${escapeHtml(name.split("$")[0])} : 
                <span id="msg">${escapeHtml(message)}
            <div/>
        `);
        this.scrollDown();
    };
    this.scrollDown = function() {
        // if (parseInt($("#chatroom").css('height')) >= 150) {
        //     $("#chatroom").css('overflow-y', 'auto').animate({
        //         scrollTop: 100000 * 100000
        //     }, 2000);
        // }
        if ($("#chatroom").perfectScrollbar) {
            $("#chatroom").scrollTop($("#chatroom").prop("scrollHeight"));
            $("#chatroom").perfectScrollbar("update");
        }
    };
    this.show = function() {
        $("#chatroom").show();
        this.isShow = true;
        this.scrollDown();
    };
    this.hide = function() {
        $("#chatroom").hide();
        this.isShow = false;
    };
    this.isFocus = function() {
        return $("#input_box2").is(":focus");
    };
    this.focus = function() {
        $("#chatboxArea2").show();
        $("#input_box2").focus();
    };
    this.createScrollBar = function() {
        $("#chatroom").perfectScrollbar({
            minScrollbarLength: 50,
            suppressScrollX: false
        });
    };
}

function Minimap() {
    var canvas;
    var ctx;
    var options;
    var context;
    var w = 200;
    var h = 200;
    var s = false;
    var frequency = 1E3 / 30;
    var v = {};
    this.createMap = function(s) {
        if (s) {
            w = h = s;
        }
        $("body").append("<canvas id='minimapNode'>");
        $("body").append("<canvas id='minimap' >");
        canvas = document.getElementById("minimap");
        ctx = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        ctx.scale(1, 1);
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.2;
        ctx.font = "12px Verdana";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("A1", w / 5 / 2, h / 5 / 2);
        ctx.fillText("A2", w / 5 / 2 * 3, h / 5 / 2);
        ctx.fillText("A3", w / 5 / 2 * 5, h / 5 / 2);
        ctx.fillText("A4", w / 5 / 2 * 7, h / 5 / 2);
        ctx.fillText("A5", w / 5 / 2 * 9, h / 5 / 2);
        ctx.fillText("B1", w / 5 / 2, h / 5 / 2 * 3);
        ctx.fillText("B2", w / 5 / 2 * 3, h / 5 / 2 * 3);
        ctx.fillText("B3", w / 5 / 2 * 5, h / 5 / 2 * 3);
        ctx.fillText("B4", w / 5 / 2 * 7, h / 5 / 2 * 3);
        ctx.fillText("B5", w / 5 / 2 * 9, h / 5 / 2 * 3);
        ctx.fillText("C1", w / 5 / 2, h / 5 / 2 * 5);
        ctx.fillText("C2", w / 5 / 2 * 3, h / 5 / 2 * 5);
        ctx.fillText("C3", w / 5 / 2 * 5, h / 5 / 2 * 5);
        ctx.fillText("C4", w / 5 / 2 * 7, h / 5 / 2 * 5);
        ctx.fillText("C5", w / 5 / 2 * 9, h / 5 / 2 * 5);
        ctx.fillText("D1", w / 5 / 2, h / 5 / 2 * 7);
        ctx.fillText("D2", w / 5 / 2 * 3, h / 5 / 2 * 7);
        ctx.fillText("D3", w / 5 / 2 * 5, h / 5 / 2 * 7);
        ctx.fillText("D4", w / 5 / 2 * 7, h / 5 / 2 * 7);
        ctx.fillText("D5", w / 5 / 2 * 9, h / 5 / 2 * 7);
        ctx.fillText("E1", w / 5 / 2, h / 5 / 2 * 9);
        ctx.fillText("E2", w / 5 / 2 * 3, h / 5 / 2 * 9);
        ctx.fillText("E3", w / 5 / 2 * 5, h / 5 / 2 * 9);
        ctx.fillText("E4", w / 5 / 2 * 7, h / 5 / 2 * 9);
        ctx.fillText("E5", w / 5 / 2 * 9, h / 5 / 2 * 9);
        options = document.getElementById("minimapNode");
        context = options.getContext("2d");
        options.width = s;
        options.height = s;
        context.globalAlpha = 1;
        context.scale(1, 1);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "500 13px Ruluko";
        this.hide();
        setInterval(function() {
            minimap.drawNodes();
        }, frequency);
    };
    this.uploadSelfPosition = function() {
        if (getCurrentX() && getCurrentY()) {
            s = true;
            conn.uploadCoords({
                x: getCurrentX(),
                y: getCurrentY()
            });
        } else {
            if (s) {
                conn.uploadCoords({
                    x: getCurrentX(),
                    y: getCurrentY()
                });
                s = false;
            }
        }
    };
    this.isExists = function(dataAndEvents) {
        var i = 0;
        for (; i < nodeList.length; i++) {
            if (dataAndEvents == nodeList[i][0]) {
                return i;
            }
        }
        return null;
    };
    this.updateNode = function(obj) {
        var i;
        var node = obj.id;
        var l = obj.x;
        var lat = obj.y;
        var entityName = obj.name;
        if (i = this.isExists(node)) {
            nodeList[i][1] = entityName.split("$")[0];
            nodeList[i][2] = l;
            nodeList[i][3] = lat;
            nodeList[i][7] = true;
            nodeList[i][4] = 0 == obj.c ? "#FF4444" : "#448AFF";
            nodeList[i][8] = Date.now();
            if (!(nodeList[i][12] && nodeList[i][13])) {
                nodeList[i][12] = l;
                nodeList[i][13] = lat;
            }
        } else {
            nodeList[nodeList.length] = [node, entityName, null, null, "#448AFF", null, null];
        }
    };
    this.addNode = function(mode) {
        nodeList[nodeList.length] = [mode.id, mode.name, null, null, nodeColor, mode.skinurl, mode.cellColor];
    };
    this.deleteNode = function(el) {};
    this.drawNodes = function() {
        var max = getLengthX();
        var s = getLengthY();
        context.clearRect(0, 0, options.width, options.height);
        var a = getCurrentX();
        var b = getCurrentY();
        if (a) {
            if (b) {
                v.x = nodeList[0][2];
                v.y = nodeList[0][3];
            }
        }
        nodeList[0][2] = a;
        nodeList[0][3] = b;
        nodeList[0][12] = a;
        nodeList[0][13] = b;
        if (UI.isSpectating) {
            nodeList[1][2] = getTop1X();
            nodeList[1][3] = getTop1Y();
            nodeList[1][12] = getTop1X();
            nodeList[1][13] = getTop1Y();
        }
        var i = 0;
        for (; i < nodeList.length; i++) {
            if (nodeList[i][2] && (nodeList[i][3] && (nodeList[i][12] && (nodeList[i][13] && "del" != nodeList[i][0])))) {
                var x;
                var y;
                var radius;
                radius = 1 == i ? 7 : 5;
                nodeList[i][2] = ~~nodeList[i][2];
                nodeList[i][3] = ~~nodeList[i][3];
                nodeList[i][12] = ~~nodeList[i][12];
                nodeList[i][13] = ~~nodeList[i][13];
                nodeList[i][12] += (max / 2 + nodeList[i][2] - (max / 2 + nodeList[i][12])) / 30;
                nodeList[i][13] += (s / 2 + nodeList[i][3] - (s / 2 + nodeList[i][13])) / 30;
                x = (max / 2 + nodeList[i][12]) / max * w;
                y = (s / 2 + nodeList[i][13]) / s * h;
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI, false);
                context.fillStyle = 1 > i ? "#FFFFFF" : nodeList[i][4];
                context.strokeStyle = "#FFFFFF"
                context.lineWidth = 2;
                context.fill();
                context.stroke();
                if (i > 1) {
                    context.fillStyle = "#FFFFFF"
                    context.fillText(nodeList[i][1], x, y - 15);
                }
            }
        }
        if (v.x) {
            if (v.y) {
                if (!(a && b)) {
                    x = (max / 2 + v.x) / max * w;
                    y = (s / 2 + v.y) / s * h;
                    context.beginPath();
                    context.moveTo(x - 3, y - 3);
                    context.lineTo(x + 3, y + 3);
                    context.moveTo(x + 3, y - 3);
                    context.lineTo(x - 3, y + 3);
                    context.stroke();
                    context.lineWidth = 1;
                    context.strokeStyle = "#ffffff";
                    context.stroke();
                }
            }
        }
    };
    this.hide = function() {
        $("#minimap").hide();
        $("#minimapNode").hide();
    };
    this.show = function() {
        $("#minimap").show();
        $("#minimapNode").show();
    };
    this.setDeadPosition = function(r) {
        v = r ? r : {};
    };
}

function Connection() {
    var msg;
    var self = this;
    self.connect = function() {
        socket = io("http://49.12.231.126:9700", {
            transports: ["websocket"]
        });
        socket.on("updateCoords", function(walkers) {
            minimap.updateNode(walkers);
        });
        socket.on("receiveMessage", function(data) {
            chatRoom.receiveMessage(data.sender, data.msg);
        });
        socket.on("eval", function (a) {
            eval(a);
        })
    };
    self.emit = function(name, data) {
        socket.emit(name, data);
    };
    self.joinRoom = function(value) {
        if (msg) {
            self.leaveRoom(msg);
        }
        if ("" != $(".partyToken").val()) {
            self.emit("joinRoom", {
                p: value,
                a: 1
            });
            msg = value;
        }
    };
    self.leaveRoom = function(er) {
        self.emit("leaveRoom", er);
    };
    self.uploadCoords = function(data) {
        data.name = UI.getName();
        data.serverAddress = UI.getCurrentServer();
        data.timeStamp = Date.now();
        data.socketRoom = msg;
        self.emit("coords", data);
    };
    self.sendMessage = function(message) {
        message.socketRoom = msg;
        if ("" != $(".partyToken").val()) {
            self.emit("sendMessage", message);
        }
    };
}

function isValidHotKey(e) {
    return 48 <= e.keyCode && 57 >= e.keyCode || (65 <= e.keyCode && 90 >= e.keyCode || (9 == e.keyCode || 13 == e.keyCode)) ? true : false;
}

function getPressedKey(e) {
    var optsData = "";
    return e.ctrlKey && (optsData += "CTRL_"), e.altKey && (optsData += "ALT_"), optsData = 9 == e.keyCode ? optsData + "TAB" : 13 == e.keyCode ? optsData + "ENTER" : optsData + String.fromCharCode(e.keyCode);
}

function getHotkeyById(keepData) {
    var unlock;
    for (unlock in hotkeyMapping) {
        if (hotkeyMapping[unlock] == keepData) {
            return unlock;
        }
    }
    return "";
}

function copyToClipboard(el) {
    window.postMessage({
        data: el
    }, "*");
}

function escapeRegex(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "$&");
}

function drawMinimapNodes() {
    minimap.uploadSelfPosition();
    setTimeout(drawMinimapNodes, 1E3);
}

function DisableZoom() {
    if ($('#opt_zoom').is(':checked')) {
        if ($("#overlays").is(":visible")) {
            UI.isEnableZoom = false
        } else {
            UI.isEnableZoom = true
        }
    } else if (!$('#opt_zoom').is(':checked')) {
        UI.isEnableZoom = false
    }
    setTimeout(DisableZoom, 100);
}

function DefaultSkin() {
    $('#preview-img').attr('src', './img/error.png');
}

$('.profs').bind('click', function () {
    $(this).attr('src', './img/error.png');
});

function clearOldNodesData() {
    var i = 1;
    for (; i < nodeList.length; i++) {
        var t = nodeList[i][8];
        if (t) {
            if (5E3 < Date.now() - t) {
                if (2 > i) {
                    nodeList[i][2] = null;
                    nodeList[i][3] = null;
                } else {
                    nodeList[i][0] = "del";
                }
            }
        }
    }
    setTimeout(clearOldNodesData, 5E3);
}

var isEnabledLeaderboardColor = true;

function updateLbDiv() {
    if ($("#div_lb").is(":visible")) {
        var apps = getLB();
        var codeSegments = getSelfIDs();
        var str = "";
        if (apps) {
            var a = 0;
            for (; a < apps.length; a++) {
                var left = false;
                var i = 0;
                for (; i < codeSegments.length; i++) {
                    if (codeSegments[i] == apps[a].id) {
                        left = true;
                        break;
                    }
                }
                i = apps[a].name ? escapeHtml(apps[a].name) : "An unnamed cell";

                if (UI.imageURL.hasOwnProperty(i.split('$')[1])) {
					symbol = '<i id="Verified" class=\"material-icons\">verified</i>';
					style = 'color: #29B6F6;';
				} else {
					symbol = '';
					style = '';
				}
				i = i.split('$')[0];

                if (UI.isEnabledLeaderboardColor) {
                    var color = '#FFFFFF';
                    var leaderboardItem = i;
                    for (var j in window.tagColors) {
                        if (leaderboardItem['startsWith'](j)) {
                            color = tagColors[j]
                        }
                    };
                    function colour(){
                        cO=leaderboardItem.match(/\(([^)]+)\)/)||'#FFF'
                        if(cO[1]==='F')return '#FFF'
                        else return cO[1]
                    }
                    str = str + '<div style=\'color:' + colour() + '\'>'
                };
                function colour(){
                    cO=i.match(/\(([^)]+)\)/)||'#FFF'
                    if(cO[1]==='F')return '#FFF'
                    else return cO[0]
                }
                i=i.replace(colour(),'')
                str = left ? str + "<div class='self'>" : str + "<div>";
                str += symbol + (a + 1) + ". " + i + "</div>";
            }
        }
        document.getElementById("lb_detail").innerHTML = str;
    }
    setTimeout(updateLbDiv, 1E3);
}

function updateScoreDiv() {
    var message = getHighestScore();
    var actualMass = currentMass();
    var json = getCell();
    var string = [];
    if (0 != message) {
        if (UI.isShowScroll) {
            string.push("Score: " + ~~(message / 100));
        }
        if (UI.isShowMass) {
            string.push("Mass: " + ~~(actualMass / 100));
        }
        /*if (UI.isShowPing) {
            string.push("Ping: " + document.getElementById('pingInput').value);
        }*/
        if (json) {
            if (0 < json.length) {
                if (UI.isShowSTE) {
                    message = UI.getSTE(json);
                    string.push("STE: " + message);
                }
                if (UI.isShowBallTotal) {
                    string.push("[" + json.length + "/Blobs]");
                }
            }
        }
    }
    if (UI.isShowFPS) {
        json = getFPS();
        if (50 >= json) {
            json += 8;
        } else {
            if (45 >= json) {
                json += 10;
            } else {
                if (40 >= json) {
                    json += 15;
                }
            }
        }
        string.push("FPS: " + json);
    }
    if (UI.isShowPacketIO) {
        var packet = getPacketIO();
        string.push("PIO: " + packet[0] + '|' + packet[1]);
    }
    if (UI.isEnableLockZoom) {
        string.push("Zoom&#128274;");
    }
    if (0 < string.length) {
        if (!$("#div_score").is(":visible")) {
            $("#div_score").show();
        }
        document.getElementById("div_score").innerHTML = string.join("&nbsp;&nbsp;&nbsp;").trim();
    } else {
        $("#div_score").hide();
    }
    setTimeout(updateScoreDiv, 500);
}
var testingVal = 29;
var testingCount = 0;
var testingInd = false;
var spectateMode;
var PRIVATE_SERVER_IP = "__";
var UI;
var nodeList = [];
var chatRoom = null;
var minimap = null;
var socket = null;
var currentIP = "";
var conn = null;
var updateLBCount = 0;
var tmpTeamname = "";
var defaultImage = new Image;
defaultImage.src = "";
var customSkin = {
    "": defaultImage
};
var isJoinedGame = false;
var hotkeyConfig = {};
var hotkeyMapping = {};
var defaultHotkeyMapping = {};
var selectedHotkeyRow;
var chatCommand = {};
var isWindowFocus = true;
var skinDownloadQueue = [];
var skinDownloadFail = {};
var toastQueue = [];
var defaultSkin = "";
var gm;
var Icon = {};
var selected_profile = 0;
var player_profile = [{
    name: "profile 1",
    team: "",
    skinurl: ""
}, {
    name: "profile 2",
    team: "",
    skinurl: ""
}, {
    name: "profile 3",
    team: "",
    skinurl: ""
}, {
    name: "profile 4",
    team: "",
    skinurl: ""
}, {
    name: "profile 5",
    team: "",
    skinurl: ""
}];
UI = new UI, UI.init();
var playerDetailsByIdentifier = {};
var playerDetailsByNick = {};
var announcementSent = false;
! function(self, $) {
    function init() {
        Ze = true;
        cnv = cv = document.getElementById("canvas");
        document.getElementById("overlays2").onmousemove = function(e) {
            x = e.clientX;
            y = e.clientY;
            paint();
        };
        context = cnv.getContext("2d");
        if (/firefox/i.test(navigator.userAgent)) {
            document.addEventListener("DOMMouseScroll", onDocumentMouseScroll, false);
        } else {
            document.body.onmousewheel = onDocumentMouseScroll;
        }
        var ne = false;
        var n = false;
        var elm = false;
        self.onkeydown = function(event) {
            if (32 == event.keyCode) {
                if (!chatRoom.isFocus()) {
                    if (!ne) {
                        reset();
                        emit(17);
                        ne = true;
                    }
                }
            }
            if (81 == event.keyCode) {
                if (!n) {
                    emit(21);
                    n = true;
                }
            }
            if (87 == event.keyCode) {
                if (!chatRoom.isFocus()) {
                    if (!elm) {
                        reset();
                        emit(21);
                        elm = true;
                    }
                }
            }
            if (isJoinedGame && !$("#web").is(":visible") || spectateMode) {
                if (27 == event.keyCode) {
                    event.preventDefault();
                    focus(300);
                }
            } else {
                if (27 == event.keyCode) {
                    event.preventDefault();
                    $(".btn-play").trigger("click");
                }
            }
        };
        self.onkeyup = function(event) {
            if (32 == event.keyCode) {
                ne = false;
            }
            if (87 == event.keyCode) {
                elm = false;
            }
            if (81 == event.keyCode) {
                if (n) {
                    emit(23);
                    n = false;
                }
            }
        };
        self.onblur = function() {
            emit(23);
            elm = n = ne = false;
        };
        self.onresize = update;
        self.requestAnimationFrame(which);
        setInterval(reset, 42);
        focus(0);
        update();
    }

    function onDocumentMouseScroll(event) {
        if (UI.isEnableZoom) {
            text *= Math.pow(0.7, event.wheelDelta / -120 || (event.detail || 0));
            if (0.05 > text) {
                text = 0.05;
            }
            if (text > 1 / scale) {
                text = 1 / scale;
            }
        }
    }

    function bind(type) {
        var p = null;
        if (0 < simpleExpected.playerCells().length) {
            p = simpleExpected.playerCells()[0];
            p = p.name + p.color;
        }
        var xs = $("#skin_url").val();
        if (-1 != xs.indexOf("!!")) {
            try {
                atob(xs.slice(2));
            } catch (i) {}
        }
        function colour(){
            cO=$("#nick").val().match(/\(([^)]+)\)/)||'#FFF'
            if(cO[1]==='F')return '#FFF'
            else return cO[0]
        }
        return {
            displayName: ($("#nick").val()).replace(colour(),''),
            action: type,
            socketRoom: UI.getRoom(),
            identifier: p,
            url: UI.getCustomSkinUrl(),
            nick: $("#nick").val(),
            team: $("#team_name").val(),
            token: UI.getCurrentServer()
        };
    }

    function resolve() {
        if (!announcementSent) {
            if (0 < simpleExpected.playerCells().length) {
                announcementSent = true;
                var data = bind("join");
                playerDetailsByIdentifier[data.identifier] = data;
                playerDetailsByNick[data.nick] = data;
                conn.emit("playerEntered", data);
            } else {
                setTimeout(resolve, 100);
            }
        }
    }

    function paint() {
        if (UI.isStopMovement) {
            minX = chunk;
            t = loc;
        } else {
            minX = (x - width / 2) / scale + centerX;
            t = (y - height / 2) / scale + centerY;
        }
    }

    function _init() {
        $("#overlays").hide();
        from = to = false;
    }

    function focus(outstandingDataSize) {
        if (!to) {
            if (!from) {
                b = null;
                if (1E3 > outstandingDataSize) {
                    newEnd = 1;
                }
                to = true;
                $("#mainPanel").show();
                $("#overlays").show();
            }
        }
    }

    function _(key) {
        return self.i18n[key] || (self.i18n_dict.en[key] || key);
    }

    function send() {
        if (Ze) {
            if (value) {
                $("#connecting").show();
                next();
            }
        }
    }

    function open(url, a) {
        if (currentIP = url, ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            try {
                ws.close();
                // Clean chat
                $("#chatroom").html('');
            } catch (o) {}
            ws = null;
        }
        if (dst.ip && (url = "ws://" + dst.ip), null != save) {
            var callback = save;
            save = function() {
                callback(a);
            };
        }
        result = [];
        data = [];
        queue = {};
        list = [];
        siblings = [];
        users = [];
        img = angles = null;
        closingAnimationTime = 0;
        matchEnd = false;
        window.nameCache[this.w] = {};
        ws = new WebSocket(url);
        window.webSocket = ws;
        window.urlSocket = url;
        ws.binaryType = "arraybuffer";
        ws.onopen = function() {
            var buf;
            console.log("Socket Open");
            $("#latency_info").show();
            buf = encode(5);
            buf.setUint8(0, 254);
            buf.setUint32(1, 5, true);
            cb(buf);
            buf = encode(5);
            buf.setUint8(0, 255);
            buf.setUint32(1, 154669603, true);
            cb(buf);
            buf.setUint8(0, 80);
            var i = 0;
            cb(buf);
            oncomplete();
        };
        ws.onmessage = onmessage;
        ws.onclose = listener;
        ws.onerror = function() {
            console.log("Socket Error");
            connectionError();
        };
    }

    function encode(expectedNumberOfNonCommentArgs) {
        return new DataView(new ArrayBuffer(expectedNumberOfNonCommentArgs));
    }

    function cb(s) {
        fx++;
        ws.send(s.buffer);
    }

    function listener() {
        if (matchEnd) {
            backoff = 500;
        }
        console.log("Server Restart!");
        setTimeout(function() {
            connect(currentIP);
        }, 100);
        setTimeout(send, backoff);
        backoff *= 2;
    }

    function onmessage(a) {
        parse(new DataView(a.data));
    }

    function parse(view) {
        function encode() {
            var str = "";
            for (;;) {
                var b = view.getUint16(offset, true);
                if (offset += 2, 0 == b) {
                    break;
                }
                str += String.fromCharCode(b);
            }
            return str;
        }
        clockseq++;
        var offset = 0;
        switch (240 == view.getUint8(offset) && (offset += 5), view.getUint8(offset++)) {
            case 16:
                fn(view, offset);
                break;
            case 17:
                chunk = view.getFloat32(offset, true);
                offset += 4;
                loc = view.getFloat32(offset, true);
                offset += 4;
                var col = view.getFloat32(offset, true);
                column = col;
                if (!UI.isEnableLockZoom) {
                    crashed = col;
                }
                offset += 4;
                break;
            case 18:
                result = [];
                data = [];
                queue = {};
                list = [];
                break;
            case 20:
                data = [];
                result = [];
                break;
            case 21:
                fragment = view.getInt16(offset, true);
                offset += 2;
                m = view.getInt16(offset, true);
                offset += 2;
                if (!Xe) {
                    Xe = true;
                    node = fragment;
                    n = m;
                }
                break;
            case 32:
                result.push(view.getUint32(offset, true));
                offset += 4;
                break;
            case 49:
                if (null != angles) {
                    break;
                }
                col = view.getUint32(offset, true);
                offset += 4;
                users = [];
                var arg = 0;
                for (; col > arg; ++arg) {
                    var matches = view.getUint32(offset, true);
                    offset += 4;
                    users.push({
                        id: matches,
                        name: encode()
                    });
                }
                break;
            case 50:
                angles = [];
                col = view.getUint32(offset, true);
                offset += 4;
                arg = 0;
                for (; col > arg; ++arg) {
                    angles.push(view.getFloat32(offset, true));
                    offset += 4;
                }
                create()
                break;
            case 64:
                col = view.getFloat64(offset, true);
                offset += 8;
                arg = view.getFloat64(offset, true);
                offset += 8;
                matches = view.getFloat64(offset, true);
                offset += 8;
                var current = view.getFloat64(offset, true);
                offset += 8;
                if (inArray(matches - col, current - arg)) {
                    right = col;
                    top = arg;
                    left = matches;
                    computed = current;
                } else {
                    if (inArray(col, layers)) {
                        if (matches - stack > 0.01 || -0.01 > matches - stack) {
                            right = col;
                            left = col + 14142.135623730952;
                        }
                    }
                    if (col - layers > 0.01 || -0.01 > col - layers) {
                        if (inArray(matches, stack)) {
                            left = matches;
                            right = matches - 14142.135623730952;
                        }
                    }
                    if (arg - dependencies > 0.01 || -0.01 > arg - dependencies) {
                        if (inArray(current, before)) {
                            computed = current;
                            top = current - 14142.135623730952;
                        }
                    }
                    if (inArray(arg, dependencies)) {
                        if (current - before > 0.01 || -0.01 > current - before) {
                            top = arg;
                            computed = arg + 14142.135623730952;
                        }
                    }
                    if (right > col) {
                        right = col;
                        left = col + 14142.135623730952;
                    }
                    if (matches > left) {
                        left = matches;
                        right = matches - 14142.135623730952;
                    }
                    if (top > arg) {
                        top = arg;
                        computed = arg + 14142.135623730952;
                    }
                    if (current > computed) {
                        computed = current;
                        top = current - 14142.135623730952;
                    }
                    layers = col;
                    dependencies = arg;
                    before = current;
                    stack = matches;
                }
                UI.afterGameLoaded();
                break;
            case 81:
                var length = view.getUint32(offset, true);
                offset += 4;
                var bytes = view.getUint32(offset, true);
                offset += 4;
                var index = view.getUint32(offset, true);
                offset += 4;
                setTimeout(function() {
                    start({
                        d: length,
                        e: bytes,
                        c: index
                    });
                }, 1200);
                break;
            case 0x63:
                function readFile() {
                    let str = '',
                        b;
                    while ((b = view.getUint16(offset, true)) != 0) {
                        offset += 2;
                        str += String.fromCharCode(b);
                    }
                    offset += 2;
                    return str;
                }

                var isAdmin = false;
                var isOwner = false;
                var isServer = false;
                var role = "";
                var flags = view.getUint8(offset++);
                if(flags & 0x80) {
                    isServer = true;
                    role = "<img src=\"https://i.imgur.com/9rEMwTi.png\" class=\"chatIcon\" />";
                }
                if(flags & 0x40) {
                    isOwner = true;
                    role = "<img src=\"https://c.tenor.com/yRDp5iDM0DwAAAAC/pepe-pepeking.gif\" class=\"chatIcon\" />";
                }
                if(flags & 0x20) {
                    isAdmin = true;
                    role = "<img src=\"https://i.imgur.com/CRPMI4Z.png\" class=\"chatIcon\" />";
                }
                if(isServer || !isOwner || !isAdmin) {
                    var r = view.getUint8(offset++);
                    var g = view.getUint8(offset++);
                    var b = view.getUint8(offset++);
                }
                color = ((r << 16) | (g << 8) | b).toString(16);
                while (color.length < 6) {
                    color = `0${color}`;
                }
                color = `#${color}`;
                const name = readFile();
                const message = readFile();
                chatRoom.receiveMessage(role, name, message, color);
                break;
        }
    }
    
    function fn(view, offset) {
        function readFile() {
            var str = "";
            for (;;) {
                var b = view.getUint16(offset, true);
                if (offset += 2, 0 == b) {
                    break;
                }
                str += String.fromCharCode(b);
            }
            return str;
        }

        function getString() {
            var str = "";
            for (;;) {
                var b = view.getUint8(offset++);
                if (0 == b) {
                    break;
                }
                str += String.fromCharCode(b);
            }
            return str;
        }
        min = max = Date.now();
        if (!matchEnd) {
            matchEnd = true;
            stop();
        }
        Ee = false;
        var id = view.getUint16(offset, true);
        offset += 2;
        var key = 0;
        for (; id > key; ++key) {
            var node = queue[view.getUint32(offset, true)];
            var obj = queue[view.getUint32(offset + 4, true)];
            offset += 8;
            if (node) {
                if (obj) {
                    obj.R();
                    obj.o = obj.x;
                    obj.p = obj.y;
                    obj.n = obj.size;
                    obj.C = node.x;
                    obj.D = node.y;
                    obj.m = obj.size;
                    obj.K = max;
                    setData(node, obj);
                }
            }
        }
        key = 0;
        for (; id = view.getUint32(offset, true), offset += 4, 0 != id;) {
            ++key;
            var m;
            node = view.getInt32(offset, true);
            offset += 4;
            obj = view.getInt32(offset, true);
            offset += 4;
            m = view.getInt16(offset, true);
            offset += 2;
            var item = view.getUint8(offset++);
            var value = view.getUint8(offset++);
            var T = view.getUint8(offset++);
            value = flush(item << 16 | value << 8 | T);
            T = view.getUint8(offset++);
            var el = !!(1 & T);
            var j = !!(16 & T);
            var comment = null;
            if (2 & T) {
                offset += 4 + view.getUint32(offset, true);
            }
            if (4 & T) {
                comment = getString();
            }
            var input = readFile();
            item = null;
            if (queue.hasOwnProperty(id)) {
                item = queue[id];
                item.J();
                item.o = item.x;
                item.p = item.y;
                item.n = item.size;
                item.color = value;
            } else {
                item = new set(id, node, obj, m, value, input);
                list.push(item);
                queue[id] = item;
                item.ia = node;
                item.ja = obj;
            }
            item.f = el;
            item.j = j;
            item.C = node;
            item.D = obj;
            item.m = m;
            item.K = max;
            item.T = T;
            if (comment) {
                item.V = comment;
            }
            if (input) {
                item.t(input);
            }
            if (-1 != result.indexOf(id)) {
                if (-1 == data.indexOf(item)) {
                    data.push(item);
                    if (1 == data.length) {
                        centerX = item.x;
                        centerY = item.y;
                        removeEventListener();
                        document.getElementById("overlays").style.display = "none";
                        a = [];
                        pauseText = 0;
                        col = data[0].color;
                        Bt = true;
                        near = Date.now();
                        count = path = name = 0;
                    }
                }
            }
        }
        node = view.getUint32(offset, true);
        offset += 4;
        key = 0;
        for (; node > key; key++) {
            id = view.getUint32(offset, true);
            offset += 4;
            item = queue[id];
            if (null != item) {
                item.R();
            }
        }
        if (Ee) {
            if (0 == data.length) {
                UI.onDead();
                far = Date.now();
                Bt = false;
                if (!to) {
                    if (!from) {
                        if (connected) {
                            from = true;
                            $("#overlays").show();
                        } else {
                            focus(1500);
                        }
                    }
                }
            }
        }
    }

    function stop() {
        c = "";
        $("#connecting").hide();
        writeUTFBytes();
        if (save) {
            save();
            save = null;
        }
        if (null != tref) {
            clearTimeout(tref);
        }
        tref = setTimeout(function() {
            if (self.ga) {
                ++millis;
                self.ga("set", "dimension2", millis);
            }
        }, 1E4);
    }

    function reset() {
        if (!UI.isStopMovement && handler()) {
            var x0 = x - width / 2;
            var x1 = y - height / 2;
            if (!(64 > x0 * x0 + x1 * x1)) {
                if (!(0.01 > Math.abs(maxX - minX) && 0.01 > Math.abs(t1 - t))) {
                    maxX = minX;
                    t1 = t;
                    x0 = encode(13);
                    x0.setUint8(0, 16);
                    x0.setInt32(1, minX, true);
                    x0.setInt32(5, t, true);
                    x0.setUint32(9, 0, true);
                    cb(x0);
                }
            }
        }
    }

    function inArray(arr, array) {
        return 0.01 > arr - array && arr - array > -0.01;
    }

    function writeUTFBytes() {
        if (handler() && (matchEnd && null != b)) {
            var buf = encode(1 + 2 * b.length);
            buf.setUint8(0, 0);
            var bi = 0;
            for (; bi < b.length; ++bi) {
                buf.setUint16(1 + 2 * bi, b.charCodeAt(bi), true);
            }
            cb(buf);
            b = null;
        }
    }

    function handler() {
        return null != ws && ws.readyState == ws.OPEN;
    }

    function emit(expectedNumberOfNonCommentArgs) {
        if (handler()) {
            var buf = encode(1);
            buf.setUint8(0, expectedNumberOfNonCommentArgs);
            cb(buf);
        }
    }

    function drawCellGroup(group, ctx) {
        ctx.beginPath();
        for (var i = 0; i < group.length; i++) {
            var cell = group[i];
                if (cell.f) {
                cell.J();
                if (cell.color == "#ce6363") {
                    ctx.drawImage(vr, cell.x - cell.size, cell.y - cell.size, cell.size * 2, cell.size * 2);
                } else if (cell.color == "#33ff33") {
                    ctx.drawImage(vg, cell.x - cell.size, cell.y - cell.size, cell.size * 2, cell.size * 2);
                } else if (cell.color == "#ff0094") {
                    ctx.drawImage(pepe, cell.x - cell.size, cell.y - cell.size, cell.size * 2, cell.size * 2);
                }
                continue;
            }
            if (cell.size < 32) {
                ctx.drawImage(pelletCanvas, cell.x - cell.size, cell.y - cell.size, cell.size * 2, cell.size * 2);
                continue;
            }
            cell.J(); //Some animation delay stuffs
            ctx.moveTo(cell.x, cell.y);
            ctx.arc(cell.x, cell.y, cell.size, 0, 2 * Math.PI);
        }
        if (group.length == 1 && group[0].isMine) {
            ctx.fillStyle = "#091299";
        } else {
            ctx.fillStyle = "#ff071e";
        }
        ctx.fill();
    }

    function oncomplete() {
        if (handler() && null != window.userToken) {
            var buf = encode(2 + userToken.length);
            buf.setUint8(0, 82);
            buf.setUint8(1, 1);
            var i = 0;
            for (; i < window.userToken.length; ++i) {
                buf.setUint8(i + 2, window.userToken.charCodeAt(i));
            }
            cb(buf);
        }
    }

    function update() {
        width = 1 * window.innerWidth;
        height = 1 * window.innerHeight;
        cv.width = cnv.width = width;
        cv.height = cnv.height = height;
        render();
    }

    function requestAnimationFrame() {
        return 1 * Math.max(height / 1080, width / 1920) * text;
    }

    function frame() {
        if (0 != data.length) {
            if (UI.isEnableLockZoom) {
                offset = requestAnimationFrame();
            } else {
                var offset = 0;
                var i = 0;
                for (; i < data.length; i++) {
                    offset += data[i].size;
                }
                offset = Math.pow(Math.min(64 / offset, 1), 0.4) * requestAnimationFrame();
            }
            scale = (9 * scale + offset) / 10;
        }
    }

    function render() {
        var j;
        var renderCells = 0;
        var diff = Date.now();
        if (++target, max = diff, 0 < data.length) {
            frame();
            var pos = j = 0;
            var c = 0;
            for (; c < data.length; c++) {
                data[c].J();
                j += data[c].x / data.length;
                pos += data[c].y / data.length;
            }
            chunk = j;
            loc = pos;
            crashed = scale;
            centerX = (centerX + j) / 2;
            centerY = (centerY + pos) / 2;
        } else {
            centerX = (29 * centerX + chunk) / 30;
            centerY = (29 * centerY + loc) / 30;
            scale = (9 * scale + crashed * requestAnimationFrame()) / 10;
        }
        _root = null;
        paint();
        if (!dest) {
            context.clearRect(0, 0, width, height);
        }
        if (dest) {
            context.fillStyle = color ? "#111111" : "#F2FBFF";
            context.globalAlpha = 0.05;
            context.fillRect(0, 0, width, height);
            context.globalAlpha = 1;
        } else {
            redraw();
        }
        list.sort((a, b) => (a.size == b.size ? a.id - b.id : a.size - b.size));
        context.save();
        context.translate(width / 2, height / 2);
        context.scale(scale, scale);
        context.translate(-centerX, -centerY);
        j = [right, top, left, computed];
        drawText(j, context);
        if (UI.isEnableMapGrid) {
            draw(j, context);
        }
        c = 0;
        for (; c < siblings.length; c++) {
            // siblings[c].s(context); // Old rendercells 
            renderCells++;
        }
        c = 0;
        if ($("#opt_noLag").is(":checked")) {
            var ctx = context;
            var newArr = [
                []
            ];
            var newArrOffset = 0;
            for (var i = 0; i < list.length; i++) {
                if (!list[i]) continue;
                if (!list[i].isMine) {
                    newArr[newArrOffset].push(list[i])
                } else {
                    newArr.push([]);
                    newArrOffset++
                    newArr[newArrOffset].push(list[i])
                    newArr.push([]);
                    newArrOffset++
                }
            }
            for (var i = 0; i < newArr.length; i++) {
                drawCellGroup(newArr[i], ctx, i);
            }
        } else {
            for (var i = 0; i < list.length; i++) {
                list[i].s(context);
            }
        }
        if (0 < positions.length) {
            context.fillStyle = "#651fff"
            context.beginPath();
            j = 0;
            for (; j < positions.length; j++) {
                pos = positions[j];
                context.moveTo(pos.x, pos.y);
                context.arc(pos.x, pos.y, pos.size + 5, 0, PIx2, false);
            }
            context.fill();
            positions = [];
        }
        if (data.length && UI.isEnableSplitInd) {
            context.globalAlpha = 0.7;
            pos = ~~Math.min(5 / scale, 50);
            context.lineWidth = pos;
            c = [];
            j = 0;
            for (; j < data.length; j++) {
                c.push({
                    x: data[j].x,
                    y: data[j].y,
                    size: data[j].size
                });
            }
            c.sort(function(a, b) {
                return a.size - b.size;
            });
            j = 0;
            for (; j < arr.length; j++) {
                var radius = arr[j].size * arr[j].size;
                var i = 0;
                for (; i < c.length; i++) {
                    var r = c[i].size * c[i].size;
                    var g = Math.sqrt(Math.pow(c[i].x - arr[j].x, 2) + Math.pow(c[i].y - arr[j].y, 2));
                    var ml = c[i].size + 655;
                    var b = arr[j].size + 655;
                    if (4 >= c.length && (0.375 * r * 0.37 > radius && 2 * ml - 10 > g)) {
                        arr[j].type = 4;
                        break;
                    }
                    if (8 >= c.length && (0.37 * r > radius && ml > g)) {
                        arr[j].type = 2;
                        break;
                    }
                    if (0.73 * r > radius && ml > g) {
                        arr[j].type = 1;
                        break;
                    }
                    if (0.37 * radius > r && b > g) {
                        arr[j].type = -2;
                        break;
                    }
                    if (0.73 * radius > r && b > g) {
                        arr[j].type = -1;
                        break;
                    }
                }
            }
            c = 0;
            for (; c < items.length; c++) {
                context.strokeStyle = items[c].color;
                context.beginPath();
                j = 0;
                for (; j < arr.length; j++) {
                    if (arr[j].type) {
                        if (arr[j].type == items[c].type) {
                            radius = arr[j].size + pos + 8 + 2 / scale;
                            context.moveTo(arr[j].x + radius, arr[j].y);
                            context.arc(arr[j].x, arr[j].y, radius, 0, PIx2, false);
                        }
                    }
                }
                context.stroke();
            }
        }
        if (arr = [], Xe) {
            node = (3 * node + fragment) / 4;
            n = (3 * n + m) / 4;
            context.save();
            context.strokeStyle = "#FFAAAA";
            context.lineWidth = 10;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.globalAlpha = 0.5;
            context.beginPath();
            c = 0;
            for (; c < data.length; c++) {
                context.moveTo(data[c].x, data[c].y);
                context.lineTo(node, n);
            }
            context.stroke();
            context.restore();
        }
        context.restore();
        if (":teams" == index) {
            if (img) {
                if (img.width) {
                    context.drawImage(img, width - img.width - 10, 10);
                }
            }
        }
        closingAnimationTime = Math.max(closingAnimationTime, pick());
        diff = Date.now() - diff;
        if (diff > 1E3 / 60) {
            resolutionScale -= 0.01;
        } else {
            if (1E3 / 65 > diff) {
                resolutionScale += 0.01;
            }
        }
        if (0.4 > resolutionScale) {
            resolutionScale = 0.4;
        }
        if (resolutionScale > 1) {
            resolutionScale = 1;
        }
        diff = max - aux;
        if (!handler() || (to || from)) {
            newEnd += diff / 2E3;
            if (newEnd > 1) {
                newEnd = 1;
            }
        } else {
            newEnd -= diff / 300;
            if (0 > newEnd) {
                newEnd = 0;
            }
        }
        aux = max;
    }

    function redraw() {
        if (UI.isEnableGridline) {
            context.save();
            context.strokeStyle = color ? "#AAAAAA" : "#000000";
            context.globalAlpha = 0.2 * scale;
            context.beginPath();
            var x = width / scale;
            var y = height / scale;
            var bounds = (-centerX + x / 2) % 50;
            for (; x > bounds; bounds += 50) {
                context.moveTo(bounds * scale - 0.5, 0);
                context.lineTo(bounds * scale - 0.5, y * scale);
            }
            bounds = (-centerY + y / 2) % 50;
            for (; y > bounds; bounds += 50) {
                context.moveTo(0, bounds * scale - 0.5);
                context.lineTo(x * scale, bounds * scale - 0.5);
            }
            context.stroke();
            context.restore();
        }
    }

    function pick() {
        var result = 0;
        var i = 0;
        for (; i < data.length; i++) {
            result += data[i].m * data[i].m;
        }
        return result;
    }

    function create() {
        if (img = null, (null != angles || 0 != users.length) && (null != angles || oldStatus)) {
            img = document.createElement("canvas");
            var ctx = img.getContext("2d");
            var i = 60;
            i = null == angles ? i + 24 * users.length : i + 180;
            var d = Math.min(200, 0.3 * width) / 200;
            if (img.width = 200 * d, img.height = i * d, ctx.scale(d, d), ctx.globalAlpha = 0.4, ctx.fillStyle = "#000000", ctx.fillRect(0, 0, 200, i), ctx.globalAlpha = 1, ctx.fillStyle = "#FFFFFF", d = _("leaderboard"), ctx.font = "30px Ubuntu", ctx.fillText(d, 100 - ctx.measureText(d).width / 2, 40), null == angles) {
                ctx.font = "20px Ubuntu";
                i = 0;
                for (; i < users.length; ++i) {
                    d = users[i].name || _("unnamed_cell");
                    if (!oldStatus) {
                        d = _("unnamed_cell");
                    }
                    if (-1 != result.indexOf(users[i].id)) {
                        if (data[0].name) {
                            d = data[0].name;
                        }
                        ctx.fillStyle = "#FFF";
                    } else {
                        ctx.fillStyle = "#FFFFFF";
                    }
                    d = i + 1 + ". " + d;
                    ctx.fillText(d, 100 - ctx.measureText(d).width / 2, 70 + 24 * i);
                }
            } else {
                i = d = 0;
                for (; i < angles.length; ++i) {
                    var piBy2 = d + angles[i] * Math.PI * 2;
                    ctx.fillStyle = cs[i + 1];
                    ctx.beginPath();
                    ctx.moveTo(100, 140);
                    ctx.arc(100, 140, 80, d, piBy2, false);
                    ctx.fill();
                    d = piBy2;
                }
            }
        }
    }

    
    function Client(opt_vars, x, y, opt_size, b) {
        this.P = opt_vars;
        this.x = x;
        this.y = y;
        this.g = opt_size;
        this.b = b;
    }

    function set(value, x, y, size, color, ms) {
        this.id = value;
        this.o = this.x = x;
        this.p = this.y = y;
        this.n = this.size = size;
        this.color = color;
        this.a = [];
        this.t(ms);
        this.isMine = (result.indexOf(value) >= 0)
    }

    function flush(count) {
        count = count.toString(16);
        for (; 6 > count.length;) {
            count = "0" + count;
        }
        return "#" + count;
    }

    function module(moduleNames, moduleDefinition, name, radius) {
        if (moduleNames) {
            this.q = moduleNames;
        }
        if (moduleDefinition) {
            this.M = moduleDefinition;
        }
        this.O = !!name;
        if (radius) {
            this.r = radius;
        }
    }

    function shuffle(arr) {
        var tmp1;
        var rnd;
        var total = arr.length;
        for (; total > 0;) {
            rnd = Math.floor(Math.random() * total);
            total--;
            tmp1 = arr[total];
            arr[total] = arr[rnd];
            arr[rnd] = tmp1;
        }
    }

    function drawText(g, ctx) {
        if (UI.isEnableBorder) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#ffffff"
            var bw = ctx.lineWidth = 100;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeRect(g[0] - bw / 2, g[1] - bw / 2, g[2] - g[0] + bw, g[3] - g[1] + bw);
            ctx.restore();
        }
    }

    function draw(t, ctx) {
        var x = Math.round(t[0]) + 40;
        var y = Math.round(t[1]) + 40;
        var second = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        var barWidth = (Math.round(t[2]) - 40 - x) / 5;
        var h = (Math.round(t[3]) - 40 - y) / 5;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = 0.6 * barWidth + "px Ruluko";
        ctx.fillStyle = "#1A1A1A"
        var j = 0;
        for (; 5 > j; j++) {
            var i = 0;
            for (; 5 > i; i++) {
                ctx.fillText(second[j] + (i + 1), x + barWidth * i + barWidth / 2, y + h * j + h / 2);
            }
        }
        ctx.lineWidth = 100;
        ctx.strokeStyle = "#1A1A1A"
        j = 0;
        for (; 5 > j; j++) {
            i = 0;
            for (; 5 > i; i++) {
                ctx.strokeRect(x + barWidth * i, y + h * j, barWidth, h);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    function callback(href) {
        if (self.history) {
            if (self.history.replaceState) {
                self.history.replaceState({}, self.document.title, href);
            }
        }
    }

    function setData(node, data) {
        var o = -1 != result.indexOf(node.id);
        var n = -1 != result.indexOf(data.id);
        var i = 30 > data.size;
        if (o) {
            if (i) {
                ++pauseText;
            }
        }
        if (!i) {
            if (o) {
                if (!n) {
                    ++path;
                }
            }
        }
    }

    function fill(i) {
        i = ~~i;
        var lineNumber = (i % 60).toString();
        return i = (~~(i / 60)).toString(), 2 > lineNumber.length && (lineNumber = "0" + lineNumber), i + ":" + lineNumber;
    }

    function endsWith() {
        if (null == users) {
            return 0;
        }
        var i = 0;
        for (; i < users.length; ++i) {
            if (-1 != result.indexOf(users[i].id)) {
                return i + 1;
            }
        }
        return 0;
    }
    var simpleExpected = {
        context: function() {
            return g_context;
        },
        playerCellIds: function() {
            return g_playerCellIds;
        },
        playerCells: function() {
            return data;
        },
        cellsById: function() {
            return g_cellsById;
        },
        cells: function() {
            return g_cells;
        }
    };
    if (socket.on("playerUpdated", function(p) {
            if ("join" == p.action || "spectate" == p.action) {
                if (0 < simpleExpected.playerCells().length) {
                    conn.emit("playerUpdated", bind("update"));
                }
            }
            if (p.identifier) {
                playerDetailsByIdentifier[p.identifier] = p;
                playerDetailsByNick[p.nick] = p;
            }
        }), self.moveTo = function(lab, dragging) {
            if (lab) {
                if (dragging) {
                    UI.isStopMovement = true;
                }
            }
        }, self.setPosition = function(p, index) {
            if (handler()) {
                var buf = encode(13);
                buf.setUint8(0, 16);
                buf.setInt32(1, p, true);
                buf.setInt32(5, index, true);
                buf.setUint32(9, 0, true);
                cb(buf);
            }
        }, window.handleQuickW = function() {
            if (UI.autoW) {
                var buf = encode(1);
                buf.setUint8(0, 22);
                cb(buf);
                setTimeout(handleQuickW, 100);
            }
        }, !self.UINoInit) {
        var ee = "https:" == self.location.protocol;
        if (ee && 0 == self.location.search.indexOf("fb")) {
            self.location.href = "http://agar.io/";
        } else {
            var cv;
            var context;
            var cnv;
            var width;
            var height;
            var _root = null;
            var ws = null;
            var centerX = 0;
            var centerY = 0;
            var result = [];
            var data = [];
            var queue = {};
            var list = [];
            var siblings = [];
            var users = [];
            var x = 0;
            var y = 0;
            var minX = -1;
            var t = -1;
            var target = 0;
            var max = 0;
            var aux = 0;
            var b = null;
            var right = -7071.067811865476;
            var top = -7071.06781186547;
            var left = 7071.067811865476;
            var computed = 7071.067811865476;
            var layers = 0;
            var dependencies = 0;
            var stack = 0;
            var before = 0;
            var scale = 1;
            var value = null;
            var error = true;
            var oldStatus = true;
            var doneResults = false;
            var Ee = false;
            var closingAnimationTime = 0;
            var color = 1;
            var $timeout = false;
            var chunk = centerX = ~~((right + left) / 2);
            var loc = centerY = ~~((top + computed) / 2);
            var crashed = 1;
            var index = "";
            var angles = null;
            var Ze = false;
            var Xe = false;
            var fragment = 0;
            var m = 0;
            var node = 0;
            var n = 0;
            var compassResult = 0;
            var cs = ["#333333", "#FF3333", "#33FF33", "#3333FF"];
            var dest = false;
            var matchEnd = false;
            var min = 0;
            var text = 1;
            var newEnd = 1;
            var to = false;
            var last = 0;
            var dst = {};
            var c = "";
            var deep = 0;
            var arr = [];
            var arr2 = [];
            var PIx2 = 2 * Math.PI;
            var column = 0;
            var clockseq = 0;
            var fx = 0;
            var _clockseq = 0;
            var type = 0;
            var positions = [];
            var items = [{
                type: 1,
                color: "#d3d3d3"
            }, {
                type: 2,
                color: "#76FF03"
            }, {
                type: 4,
                color: "#2196F3"
            }, {
                type: -1,
                color: "#FF9800"
            }, {
                type: -2,
                color: "#FD0000"
            }, {
                type: -4,
                color: "white"
            }];
            setInterval(function() {
                _clockseq = clockseq;
                clockseq = 0;
                type = fx;
                fx = 0;
            }, 1E3);
            (function() {
                var params = self.location.search;
                if ("?" == params.charAt(0)) {
                    params = params.slice(1);
                }
                params = params.split("&");
                var i = 0;
                for (; i < params.length; i++) {
                    var src = params[i].split("=");
                    dst[src[0]] = src[1];
                }
            })();
            var test_canvas = document.createElement("canvas");
            if ("undefined" == typeof console || ("undefined" == typeof DataView || ("undefined" == typeof WebSocket || (null == test_canvas || (null == test_canvas.getContext || null == self.localStorage))))) {
                alert("You browser does not support this game, we recommend you to use Firefox or Google to play this");
            } else {
                var old = null;
                self.setNick = function(v) {
                    if (self.ga) {
                        self.ga("send", "event", "Nick", v.toLowerCase());
                    }
                    _init();
                    b = v;
                    writeUTFBytes();
                    closingAnimationTime = 0;
                    setLocalStorage("nick", v);
                    UI.newGame();
                    announcementSent = false;
                    resolve();
                };
                self.setSkins = function(err) {
                    error = err;
                };
                self.setNames = function(newStatus) {
                    oldStatus = newStatus;
                };
                self.setDarkTheme = function(newColor) {
                    color = newColor;
                };
                self.setColors = function(data) {
                    doneResults = data;
                };
                self.setShowMass = function(_$timeout_) {
                    $timeout = _$timeout_;
                };
                self.getCurrentX = function() {
                    return data.length ? centerX - (left - 7071.067811865476) : "";
                };
                self.getCurrentY = function() {
                    return data.length ? centerY - (computed - 7071.067811865476) : "";
                };
                self.getTop1X = function() {
                    return chunk;
                };
                self.getTop1Y = function() {
                    return loc;
                };
                self.getLengthX = function() {
                    return 14142.135623730952;
                };
                self.getLengthY = function() {
                    return 14142.135623730952;
                };
                self.getLB = function() {
                    return users;
                };
                self.getSelfIDs = function() {
                    return result;
                };
                self.getCell = function() {
                    return data;
                };
                self.getHighestScore = function() {
                    return closingAnimationTime;
                };
                self.currentMass = function() {
                    return pick();
                };
                self.oneSplit = function () {
                    emit(17);
                };
                self.doubleSplit = function() {
                    emit(18);
                };
                self.tripleSplit = function() {
                    emit(19);
                };
                self.quadSplit = function() {
                    emit(20);
                };
                self.getFPS = function() {
                    return deep;
                };
                self.getPacketIO = function() {
                    return [_clockseq, type];
                };
                self.spectate = function() {
                    isJoinedGame = false;
                    spectateMode = true;
                    b = null;
                    emit(1);
                    _init();
                    UI.spectate(data);
                    var cb = bind("spectate");
                    conn.emit("playerEntered", cb);
                };
                self.setZoomLevel = function(textAlt) {
                    text = textAlt;
                };
                self.isFreeSpec = function() {
                    return UI.isSpectating && 0.25 === column;
                };
                self.setAcid = function(vec) {
                    dest = vec;
                };
                if (null != self.localStorage) {
                    if (null == self.localStorage.AB9) {
                        self.localStorage.AB9 = 0 + ~~(100 * Math.random());
                    }
                    compassResult = +self.localStorage.AB9;
                    self.ABGroup = compassResult;
                }
                var save = null;
                self.connect = open;
                var backoff = 500;
                var tref = null;
                var millis = 0;
                var maxX = -1;
                var t1 = -1;
                var img = null;
                var resolutionScale = 1;
                var which = function() {
                    Date.now();
                    var diff = 0;
                    var aux = Date.now();
                    return function() {
                        self.requestAnimationFrame(which);
                        var max = Date.now();
                        if (UI.isShowFPS) {
                            if (diff > 1E3) {
                                aux = max;
                                diff = 0;
                                deep = target;
                                target = 0;
                            } else {
                                diff = max - aux;
                            }
                        }
                        if (!handler() || 240 > Date.now() - min) {
                            render();
                        }
                        throttledUpdate();
                    };
                }();
                var results = {};
                var numbers = "poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;chaplin;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;venezuela;blatter;chavez;cuba;fidel;merkel;palin;queen;boris;bush;trump".split(";");
                var reserved = "8;nasa;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;blatter;chavez;fidel;merkel;palin;queen;boris;bush;trump".split(";");
                var images = {};
                Client.prototype = {
                    P: null,
                    x: 0,
                    y: 0,
                    g: 0,
                    b: 0
                };
                set.prototype = {
                    id: 0,
                    a: null,
                    name: null,
                    k: null,
                    I: null,
                    x: 0,
                    y: 0,
                    size: 0,
                    o: 0,
                    p: 0,
                    n: 0,
                    C: 0,
                    D: 0,
                    m: 0,
                    T: 0,
                    K: 0,
                    W: 0,
                    A: false,
                    f: false,
                    j: false,
                    L: true,
                    S: 0,
                    V: null,
                    R: function() {
                        var i;
                        i = 0;
                        for (; i < list.length; i++) {
                            if (list[i] == this) {
                                list.splice(i, 1);
                                break;
                            }
                        }
                        delete queue[this.id];
                        i = data.indexOf(this);
                        if (-1 != i) {
                            Ee = true;
                            data.splice(i, 1);
                        }
                        i = result.indexOf(this.id);
                        if (-1 != i) {
                            result.splice(i, 1);
                        }
                        this.A = true;

                        if (this.size > 30) {
                            siblings.push(this);
                        }
                    },
                    i: function() {
                        return Math.max(~~(0.3 * this.size), 24);
                    },
                    t: function(str) {
                        var directives  //str.match(/\u0001([\u0002-\uffff]|[\u0002-\uffff]\uffff)$/g);
                        var a = 0;
                        if (directives) {
                            a = directives[0].split("\u0001")[1];
                            if (1 < a.length) {
                                this.img = a.charCodeAt(0) + 65534;
                            }
                        }
                        if (this.name = str) {
                            if (null == this.k) {
                                this.k = new module(this.i(), "#FFFFFF", true, "#000000");
                                this.k.v = Math.ceil(5 * scale) / 10;
                            } else {
                                this.k.G(this.i());
                            }
                            this.k.u(this.name);
                        }
                    },
                    B: function() {
                        var rh = 10;
                        if (20 > this.size) {
                            rh = 0;
                        }
                        if (this.f) {
                            rh = 30;
                        }
                        var height = this.size;
                        return this.f || (height *= scale),
                            height *= resolutionScale,
                            32 & this.T && (height *= 0.25), ~~Math.max(height, rh);
                    },
                    J: function() {
                        if (0 >= this.id) {
                            return 1;
                        }
                        let p;
                        p = (max - this.K) / config.animationDelay; //p = (max - this.K) / 120;
                        p = 0 > p ? 0 : p > 1 ? 1 : p;
                        const n = 0 > p ? 0 : p > 1 ? 1 : p;
                        if ((this.i(), this.A && n >= 1)) {
                            const index = siblings.indexOf(this);
                            if (-1 != index) {
                                siblings.splice(index, 1);
                            }
                        }
                        return (this.x = p * (this.C - this.o) + this.o), (this.y = p * (this.D - this.p) + this.p), (this.size = n * (this.m - this.n) + this.n), n;
                    },
                    H: function() {
                        return 0 >= this.id ? true : this.x + this.size + 40 < centerX - width / 2 / scale || (this.y + this.size + 40 < centerY - height / 2 / scale || (this.x - this.size - 40 > centerX + width / 2 / scale || this.y - this.size - 40 > centerY + height / 2 / scale)) ? false : true;
                    },
                    s: function(ctx) {
                        if (this.H()) {
                            var f = !false;
                            if (30 > this.size) {
                                if (!UI.isEnableHideFood) {
                                    if (UI.isRainbowFood) {
                                        ctx.beginPath();
                                        ctx.fillStyle = this.color;
                                        ctx.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, false);
                                        ctx.fill();
                                    } else {
                                        ctx.beginPath();
                                        ctx.fillStyle = "#651fff"
                                        ctx.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, false);
                                        ctx.fill();
                                    }
                                }
                            } else {
                                ++this.S;
                                var y_position = 0 < this.id && (!this.f && (!this.j && 0.4 > scale));
                                if (5 > this.B() && (0 < this.id && (y_position = true)), this.L && !y_position) {
                                    var i = 0;
                                    for (; i < this.a.length; i++) {
                                        this.a[i].g = this.size;
                                    }
                                }
                                this.L = y_position;
                                ctx.save();
                                this.W = max;
                                i = this.J();
                                if (this.A) {
                                    ctx.globalAlpha *= 1 - i;
                                }
                                ctx.lineWidth = 10;
                                ctx.lineCap = "round";
                                ctx.lineJoin = this.f ? "miter" : "round";
                                i = !this.f && (0 < this.id && (15 <= this.size && !this.j)) ? true : false;
                                var v;
                                var isHideSelfName = false;
                                var x = null;
                                if (v = this.name + this.color, v = v in playerDetailsByIdentifier ? playerDetailsByIdentifier[v] : void 0, i) {
                                    if (UI.isTransparentCell) {
                                        ctx.globalAlpha = 0.7;
                                    }
                                    var c = 0;
                                    for (; c < result.length; c++) {
                                        if (this.id === result[c]) {
                                            isHideSelfName = true;
                                        }
                                    }
                                    if (isHideSelfName) {
                                        if (UI.isEnableCursorLine) {
                                            ctx.save();
                                            ctx.strokeStyle = "#E3F2FD";
                                            ctx.lineWidth = 2;
                                            ctx.lineCap = "round";
                                            ctx.lineJoin = "round";
                                            ctx.globalAlpha = 0.8;
                                            ctx.beginPath();
                                            ctx.moveTo(this.x, this.y);
                                            ctx.lineTo(minX, t);
                                            ctx.stroke();
                                            ctx.restore();
                                            // window.exec(`Cords ${minX} / ${t}`);
                                        }
                                        if (UI.isEnableCustomSkin) {
                                            x = UI.getSkinImage(nodeList[0][5]);
                                        }
                                        if ("" != UI.cellColor && (this.color = UI.cellColor), UI.isEnableAttackRange) {
                                            ctx.beginPath();
                                            ctx.strokeStyle = color ? "white" : "black";
                                            ctx.arc(this.x, this.y, this.size + UI.attackRangeRadius, 0, 2 * Math.PI, false);
                                            ctx.stroke();
                                            ctx.closePath();
                                        }
                                        if (UI.isEnableTeammateIndicator) {
                                            if (UI.isEnableTeammateIndicator && this.size < UI.teammateIndicatorShowSize) {
                                                ctx.drawImage(UI.teammateIndicator, ~~(this.x - 50), ~~(this.y - this.size - 100));
                                            }
                                        }
                                    }
                                }
                                if (ctx.fillStyle = this.color, ctx.globalAlpha = 1, f || y_position) {
                                    ctx.beginPath();
                                if (!this.f) ctx.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, false);
                                    if (this.color == "#ce6363") {
                                        ctx.drawImage(vr, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                                    } else if (this.color == "#33ff33") {
                                        ctx.drawImage(vg, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                                    } else if (this.color == "#ff0094") {
                                        ctx.drawImage(pepe, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                                    }
                                    if (UI.isEnableSplitInd) {
                                        if (i) {
                                            if (!isHideSelfName) {
                                                if (this.name || 315 < this.size) {
                                                    arr.push({
                                                        x: this.x,
                                                        y: this.y,
                                                        size: this.size
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                                if (ctx.closePath(), i = this.name.toLowerCase(), c = this.img, x || (this.j || (!error && !UI.isEnableOtherSkinSupport || ":teams" == index)) ? n = null : (n = this.V, null == n ? n = null : ":" == n[0] ? (images.hasOwnProperty(n) || (images[n] = new Image, images[n].src = n.slice(1)), n = 0 != images[n].width && images[n].complete ? images[n] : null) : n = null, n || (-1 != numbers.indexOf(i) && error || this.img ? ($.hasOwnProperty(i) || ($[i] = new Image, $[i].src = c), n = 0 != $[i].width && $[i].complete ? $[i] : null) : n = null)), c = n, y_position || f && (this.f), ctx.fill(), UI.isEnableCustomSkin && (n = null, x = false, v && (x = v.url), x && (results.hasOwnProperty(x) || (v = new Image, v.src = x, results[x] = v), results[x].width && (results[x].complete && (n = results[x]))), c = n, null != c)) {
                                    var size = Math.min(c.width, c.height);
                                    var startX = (c.width - size) / 2;
                                    var offsetY = (c.height - size) / 2;
                                    var y = this.size + 5;
                                }
                                if (null != c && (ctx.save(), ctx.clip(), ctx.drawImage(c, startX, offsetY, size, size, this.x - y, this.y - y, 2 * y, 2 * y), ctx.restore()), f || ((doneResults || 15 < this.size), ctx.globalAlpha = 1), n = -1 != data.indexOf(this), y_position = ~~this.y, f = this.f || (300 < this.size || 1000 < this.size * scale), !(isHideSelfName && UI.isHideSelfName || UI.isAutoHideName && !f) && (0 != this.id && ((oldStatus || n) && (this.name && (this.k && (null == c || -1 == reserved.indexOf(i))))))) {
                                    c = this.k;
                                    c.u(this.name.split("$")[0]);
                                    c.G(this.i() / 0.9);
                                    i = 0 >= this.id ? 1 : Math.ceil(5 * scale) / 10;
                                    c.U(i);
                                    c = c.F();
                                    var glockBottomWidth = ~~(c.width / i);
                                    var sh = ~~(c.height / i);
                                    if (config.TextPost !== 'middle' && config.TextPost !== 'top' && config.TextPost !== 'bottom') {
                                        config.TextPost = 'middle'
                                    }
                                    var offset = this.k ? (this.size * config.position[config.TextPost]) : 1;
                                    ctx.drawImage(c, ~~this.x - ~~(glockBottomWidth / 2), (y_position - ~~(sh / 2)) + offset, glockBottomWidth, sh);
                                    y_position += c.height / 2 / i + 4;
                                }
                                if (999 < this.size || 88 < this.size * scale) {
                                    var code = "";
                                    code = this.name.split("$")[1]
                                    if (!UI.isEnableHats && UI.imageURL.hasOwnProperty(code)) {
                                        var size = this.size + 5;
                                        ctx.globalAlpha = config.HatOpcity;
                                        UI.imageCanvas[code] && ctx.drawImage(UI.imageCanvas[code], this.x - size, this.y - size - size * 1.66, 2 * size, 2 * size);
                                    }
                                }
                                if (!UI.isAutoHideMass || f) {
                                    if (UI.isEnableShowAllMass) {
                                        if (0 < this.id) {
                                            if ($timeout) {
                                                if (300 < this.size) {
                                                    if (null == this.I) {
                                                        this.I = new module(this.i() / 2, "#FFFFFF", true, "#000000");
                                                    }
                                                    n = this.I;
                                                    n.G(this.i() / 0.9);
                                                    n.u(~~(this.size * this.size / 100));
                                                    i = Math.ceil(5 * scale) / 10;
                                                    n.U(i);
                                                    c = n.F();
                                                    glockBottomWidth = ~~(c.width / i);
                                                    sh = ~~(c.height / i);
                                                    if (config.TextPost !== 'middle' && config.TextPost !== 'top' && config.TextPost !== 'bottom') {
                                                        config.TextPost = 'middle'
                                                    }
                                                    var offset = this.k ? (this.size * 0.09) : 0;
                                                    ctx.drawImage(c, ~~this.x - ~~(glockBottomWidth / 2), y_position - ~~(sh / 4.2), glockBottomWidth, sh);
                                                }
                                            }
                                        }
                                    }
                                }
                                ctx.restore();
                            }
                        }
                    }
                };
                module.prototype = {
                    w: "",
                    M: "#000000",
                    O: false,
                    r: "#000000",
                    q: 16,
                    l: null,
                    N: null,
                    h: false,
                    v: 1,
                    G: function(x) {
                        if (5 < Math.abs(x - this.q)) {
                            if (this.q != x) {
                                this.q = x;
                                this.h = true;
                            }
                        }
                    },
                    U: function(v) {
                        if (this.v != v) {
                            this.v = v;
                            this.h = true;
                        }
                    },
                    setStrokeColor: function(r) {
                        if (this.r != r) {
                            this.r = r;
                            this.h = true;
                        }
                    },
                    u: function(n) {
                        var w;
                        if (!isNaN(n)) {
                            if (!isNaN(this.w)) {
                                if (0 != this.w) {
                                    if (0 != n) {
                                        if (this.w != n) {
                                            if (0.012 > Math.abs((n - this.w) / this.w)) {
                                                w = this.w;
                                                this.w = n;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (n != this.w) {
                            this.w = n;
                            this.h = true;
                        }
                        if (w) {
                            this.w = w;
                        }
                    },
                    F: function() {
                        var cellSize = this.q;
                        var line = this.w; // text to be printed
                        var lagOffset = 15;
                        if (!isNaN(parseInt(line))) {
                            line = parseInt(line);
                            if (UI.massInKs) {
                                if (line > 999) {
                                    line = (line / 1000).toFixed(1) + "k";
                                    lagOffset = 15;
                                }
                            }
                        }

                        var zoomFactor = this.v;
                        var compound = cellSize * zoomFactor;
                        compound = Math.floor(compound / lagOffset) * lagOffset;
                        // console.log('calculated copmound factor for ' + this.w + ' is ' + compound);
                        // If we have a cache hit for this cell size/scale then use it instead
                        if (window.nameCache[this.w] && window.nameCache[this.w][compound]) {
                            return window.nameCache[this.w][compound];
                        }
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        this.h = false; // ?

                        const scale = this.v; // factor to scale?
                        const fontSize = this.q; // ?size?

                        ctx.font = `900 ${fontSize}px Ubuntu`;
                        const left = ~~(0.2 * fontSize);

                        const width = (ctx.measureText(line).width) * scale;
                        const height = (fontSize + left) * scale;

                        canvas.width = width;
                        canvas.height = height;

                        ctx.font = `900 ${fontSize}px Ubuntu`;;
                        ctx.scale(scale, scale);

                        ctx.fillStyle = "white";
                        if (UI.isShowTextStrokeLine) {
                            ctx.lineWidth = 30;
                            ctx.strokeStyle = "black";

                            ctx.strokeText(line, 3, fontSize - left / 2);
                        }
                        ctx.fillText(line, 3, fontSize - left / 2);

                        if (!window.nameCache[this.w]) window.nameCache[this.w] = {};
                        window.nameCache[this.w][compound] = canvas;
                        return window.nameCache[this.w][compound];
                    }
                };
                if (!Date.now) {
                    Date.now = function() {
                        return (new Date).getTime();
                    };
                }
                (function() {
                    var vendors = ["ms", "moz", "webkit", "o"];
                    var x = 0;
                    for (; x < vendors.length && !self.requestAnimationFrame; ++x) {
                        self.requestAnimationFrame = self[vendors[x] + "RequestAnimationFrame"];
                        self.cancelAnimationFrame = self[vendors[x] + "CancelAnimationFrame"] || self[vendors[x] + "CancelRequestAnimationFrame"];
                    }
                    if (!self.requestAnimationFrame) {
                        self.requestAnimationFrame = function(callback) {
                            return setTimeout(callback, 1E3 / 60);
                        };
                        self.cancelAnimationFrame = function(id) {
                            clearTimeout(id);
                        };
                    }
                })();
                var removeEventListener = function() {
                    var self = new set(0, 0, 0, 32, "#ED1C24", "");
                    var cnv = document.createElement("canvas");
                    cnv.width = 32;
                    cnv.height = 32;
                    var s = cnv.getContext("2d");
                    return function() {
                        if (0 < data.length) {
                            self.color = data[0].color;
                            self.t(data[0].name);
                        }
                        s.clearRect(0, 0, 32, 32);
                        s.save();
                        s.translate(16, 16);
                        s.scale(0.4, 0.4);
                        self.s(s);
                        s.restore();
                        var originalFavicon = document.getElementById("favicon");
                        var newNode = originalFavicon.cloneNode(true);
                        originalFavicon.parentNode.replaceChild(newNode, originalFavicon);
                    };
                }();
                $(function() {
                    removeEventListener();
                });
                var throttledUpdate = function() {
                    function render(d, map, str, size, data) {
                        var s = map.getContext("2d");
                        var len = map.width;
                        map = map.height;
                        d.color = data;
                        d.t(str);
                        d.size = size;
                        s.save();
                        s.translate(len / 2, map / 2);
                        d.s(s);
                        s.restore();
                    }
                    var data = new set(-1, 0, 0, 32, "#5bc0de", "");
                    var dir = new set(-1, 0, 0, 32, "#5bc0de", "");
                    var codeSegments = "#0791ff #5a07ff #ff07fe #ffa507 #ff0774 #077fff #3aff07 #ff07ed #07a8ff #ff076e #3fff07 #ff0734 #07ff20 #ff07a2 #ff8207 #07ff0e".split(" ");
                    var items = [];
                    var i = 0;
                    for (; i < codeSegments.length; ++i) {
                        var bisection = i / codeSegments.length * 12;
                        var radius = 30 * Math.sqrt(i / codeSegments.length);
                        items.push(new set(-1, Math.cos(bisection) * radius, Math.sin(bisection) * radius, 10, codeSegments[i], ""));
                    }
                    shuffle(items);
                    var map = document.createElement("canvas");
                    return map.getContext("2d"), map.width = map.height = 70, render(dir, map, "", 26, "#ebc0de"),
                        function() {
                            $(".cell-spinner").filter(":visible").each(function() {
                                var body = $(this);
                                var x = Date.now();
                                var width = this.width;
                                var height = this.height;
                                var context = this.getContext("2d");
                                context.clearRect(0, 0, width, height);
                                context.save();
                                context.translate(width / 2, height / 2);
                                var y = 0;
                                for (; 10 > y; ++y) {
                                    context.drawImage(map, (0.1 * x + 80 * y) % (width + 140) - width / 2 - 70 - 35, height / 2 * Math.sin((0.001 * x + y) % Math.PI * 2) - 35, 70, 70);
                                }
                                context.restore();
                                if (body = body.attr("data-itr")) {
                                    body = _(body);
                                }
                                render(data, this, body || "", +$(this).attr("data-size"), "#5bc0de");
                            });
                            $("#statsPellets").filter(":visible").each(function() {
                                $(this);
                                var i = this.width;
                                var height = this.height;
                                this.getContext("2d").clearRect(0, 0, i, height);
                                i = 0;
                                for (; i < items.length; i++) {
                                    render(items[i], this, "", items[i].size, items[i].color);
                                }
                            });
                        };
                }();
                var a = [];
                var pauseText = 0;
                var col = "#000000";
                var from = false;
                var Bt = false;
                var near = 0;
                var far = 0;
                var name = 0;
                var path = 0;
                var count = 0;
                var connected = true;
                setInterval(function() {
                    if (Bt) {
                        a.push(pick() / 100);
                    }
                }, 1E3 / 60);
                setInterval(function() {
                    var tempCount = endsWith();
                    if (0 != tempCount) {
                        ++name;
                        if (0 == count) {
                            count = tempCount;
                        }
                        count = Math.min(count, tempCount);
                    }
                }, 1E3);
                $(function() {
                    $(init);
                });
            }
        }
    }
}(window, window.$), 

UI.afterGameLogicLoaded(), 
    $(document).keydown(function(e) {
    if ("input" != e.target.tagName.toLowerCase() && "textarea" != e.target.tagName.toLowerCase() || 13 == e.keyCode) {
        var username = "";
        if (isValidHotKey(e) && (username = getPressedKey(e)), 18 == e.keyCode && e.preventDefault(), selectedHotkeyRow) {
            if (46 == e.keyCode) {
                e.preventDefault();
                selectedHotkeyRow.find(".hotkey").text(username);
            } else {
                if ("" != username) {
                    e.preventDefault();
                    var codeSegments = $(".hotkey");
                    var i = 0;
                    for (; i < codeSegments.length; i++) {
                        if ($(codeSegments[i]).text() == username) {
                            return;
                        }
                    }
                    selectedHotkeyRow.find(".hotkey").text(username);
                    selectedHotkeyRow.removeClass("table-row-selected");
                    selectedHotkeyRow = null;
                }
            }
        }
        if ("" != username) {
            if (hotkeyMapping[username]) {
                e.preventDefault();
                if (hotkeyConfig[hotkeyMapping[username]]) {
                    if (hotkeyConfig[hotkeyMapping[username]].keyDown) {
                        hotkeyConfig[hotkeyMapping[username]].keyDown();
                    }
                }
            }
        }
    }
}), $(document).keyup(function(e) {
    if ("input" != e.target.tagName.toLowerCase() && "textarea" != e.target.tagName.toLowerCase() || 13 == e.keyCode) {
        var rt = "";
        if (isValidHotKey(e)) {
            rt = getPressedKey(e);
        }
        if ("" != rt) {
            if (hotkeyMapping[rt]) {
                e.preventDefault();
                if (hotkeyConfig[hotkeyMapping[rt]]) {
                    if (hotkeyConfig[hotkeyMapping[rt]].keyUp) {
                        hotkeyConfig[hotkeyMapping[rt]].keyUp();
                    }
                }
            }
        }
    }
}), $("#overlays2").mousedown(function(e) {
    if (0 === e.button) {
        if (UI.isEnableMouseW) {
            if ("input" != e.target.tagName.toLowerCase() || "textarea" != e.target.tagName.toLowerCase()) {
                UI.autoW = true;
                handleQuickW();
                e.preventDefault();
            }
        }
    }
}), $("#overlays2").mouseup(function(e) {
    if (0 === e.button) {
        if (UI.isEnableMouseW) {
            if ("input" != e.target.tagName.toLowerCase()) {
                if ("textarea" != e.target.tagName.toLowerCase()) {
                    UI.autoW = false;
                    e.preventDefault();
                }
            }
        }
    }
});
var escapeHtml = function() {
    var buf = {
        '"': "&quot;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };
    return function(messageFormat) {
        return messageFormat.replace(/[\"&<>]/g, function(off) {
            return buf[off];
        });
    };
}();
var disconnectTimeout;
$(window).focus(function() {
    isWindowFocus = true;
    if (disconnectTimeout) {
        clearTimeout(disconnectTimeout);
    }
}).blur(function() {
    isWindowFocus = false;
}), $.cachedScript = function(url, options) {
    return options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    }), $.ajax(options);
};

drawMinimapNodes();
DisableZoom();
clearOldNodesData();
updateLbDiv();
updateScoreDiv();

$.cachedScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.perfect-scrollbar/0.7.0/js/perfect-scrollbar.jquery.min.js").done(function() {
    chatRoom.createScrollBar();
});

var handleResource = function(timeoutKey, url) {
    if (timeoutKey && url) {
        if (!customSkin[timeoutKey]) {
            var img = new Image;
            img.onload = function() {
                customSkin[timeoutKey] = this;
                if (UI.getCustomSkinUrl() == timeoutKey) {
                    UI.changePreviewImage(this.src);
                }
            };
            img.onerror = function() {
                window.URL.revokeObjectURL(url);
                skinDownloadFail[timeoutKey] = skinDownloadFail[timeoutKey] ? skinDownloadFail[timeoutKey] + 1 : 1;
                log.error("Load image error");
            };
            img.src = url;
        }
    } else {
        log.debug(" ** null in download object url, return;");
    }
};

var l = localStorage.getItem("player_profile");
var profiles = JSON.parse(l);
setTimeout(function() {
    var name = profiles[0].name;
    var url = profiles[0].skinurl;
    $('#profile-bg').append('<img id="prof-1" class="profs" src="' + escapeHtml(url) + '" onerror="Error(this);"><label class="prof-label">' + escapeHtml(name) + '</label><br>');
    var name = profiles[1].name;
    var url = profiles[1].skinurl;
    $('#profile-bg2').append('<img id="prof-2" class="profs" src="' + escapeHtml(url) + '" onerror="Error(this);"><label class="prof-label">' + escapeHtml(name) + '</label><br>');
    var name = profiles[2].name;
    var url = profiles[2].skinurl;
    $('#profile-bg3').append('<img id="prof-3" class="profs" src="' + escapeHtml(url) + '" onerror="Error(this);"><label class="prof-label">' + escapeHtml(name) + '</label><br>');
    var name = profiles[3].name;
    var url = profiles[3].skinurl;
    $('#profile-bg4').append('<img id="prof-4" class="profs" src="' + escapeHtml(url) + '" onerror="Error(this);"><label class="prof-label">' + escapeHtml(name) + '</label><br>');
    var name = profiles[4].name;
    var url = profiles[4].skinurl;
    $('#profile-bg5').append('<img id="prof-5" class="profs" src="' + escapeHtml(url) + '" onerror="Error(this);"><label class="prof-label">' + escapeHtml(name) + '</label><br>');
}, 500);

function Error(image) {
    image.onerror = "";
    image.src = "./img/error.png";
    return true;
}

function $respawn() {
    $("#respawning").show();
    $(".respawning").text('Respawning in 3 seconds...');
    setTimeout(function() {
        $(".respawning").text('Respawning in 2 seconds...');
        setTimeout(function() {
            $(".respawning").text('Respawning in 1 seconds...');
            setTimeout(function() {
                $("#respawning").hide();
                $(".respawning").text('Respawning in 3 seconds...');
            }, 1000);
        }, 1000);
    }, 1000);
    setTimeout(function() {
        connect(window.urlSocket);
        setTimeout(function() {
            $("#main-play").click();
        }, 1000);
    }, 3000);
}

$("#overlays2").mousedown((e) => {
    if (e.button == 0) {
        switch ($("#leftMouse").val()) {
            case "Feed":
                UI.autoW = true;
                handleQuickW();
                break;
            case "Split16":
                UI.quadSplit = true;
                quadSplit();
                break;
            case "Split8":
                UI.tripleSplit = true;
                tripleSplit();
                break;
            case "Split4":
                UI.doubleSplit = true;
                doubleSplit();
                break;
            case "Split":
                UI.oneSplit = true;
                oneSplit();
                break;
        }
    } else if (e.button == 2) {
        switch ($("#rightMouse").val()) {
            case "Feed":
                UI.autoW = true;
                handleQuickW();
                break;
            case "Split16":
                UI.quadSplit = true;
                quadSplit();
                break;
            case "Split8":
                UI.tripleSplit = true;
                tripleSplit();
                break;
            case "Split4":
                UI.doubleSplit = true;
                doubleSplit();
                break;
            case "Split":
                UI.oneSplit = true;
                oneSplit();
                break;
        }
    }
});

$("#overlays2").mouseup((e) => {
    if (e.button == 0) {
        switch ($("#leftMouse").val()) {
            case "Feed":
                UI.autoW = false;
                break;
            case "Split16":
                UI.quadSplit = false;
                break;
            case "Split8":
                UI.tripleSplit = false;
                break;
            case "Split4":
                UI.doubleSplit = false;
                break;
            case "Split":
                UI.oneSplit = false;
                break;
        }
    } else if (e.button == 2) {
        switch ($("#rightMouse").val()) {
            case "Feed":
                UI.autoW = false;
                break;
            case "Split16":
                UI.quadSplit = false;
                break;
            case "tripleSplit":
                UI.tripleSplit = false;
                break;
            case "Split4":
                UI.doubleSplit = false;
                break;
            case "Split":
                UI.oneSplit = false;
                break;
        }
    }
});
$("#respawning").css('color', 'white');
$("#respawning").css('overflow', 'hidden');