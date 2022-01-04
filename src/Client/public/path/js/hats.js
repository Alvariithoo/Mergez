$("#preview-img").attr("src", $("#skin_url").val());
$("#skin_url").change(function() {
    $("#preview-img").attr("src", this.value);
});

document.querySelector("#KeysClose").onclick = () => {
    UI.toggleHats();
};
document.querySelector("#save").onclick = () => {
    saveHotkeys();
    UI.toggleHats();
};
document.querySelector("#reset").onclick = () => {
    resetDefaultHotkey();
};