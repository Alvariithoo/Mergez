$("#preview-img").attr("src", $("#skin_url").val());
$("#skin_url").change(function() {
    $("#preview-img").attr("src", this.value);
});

document.querySelector("#KeysClose").onclick = () => {
    UI.toggleKeys();
};
document.querySelector("#save").onclick = () => {
    saveHotkeys();
    UI.toggleKeys();
};
document.querySelector("#reset").onclick = () => {
    resetDefaultHotkey();
};