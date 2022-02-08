$("#preview-img").attr("src", $("#skin_url").val());
$("#skin_url").change(function() {
    $("#preview-img").attr("src", this.value);
});

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

document.querySelector("#KeysClose").onclick = () => {
    UI.toggleKeys();
};
document.querySelector("#KeySettins").onclick = () => {
    $('#KeysPanel').fadeToggle();
};
document.querySelector("#save").onclick = () => {
    saveHotkeys();
};
document.querySelector("#reset").onclick = () => {
    resetDefaultHotkey();
};
document.querySelector("#main-play").onclick = () => {
    UI.play();
};
document.querySelector(".btn-spectate").onclick = () => {
    spectate();
};