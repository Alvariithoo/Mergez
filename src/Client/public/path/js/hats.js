$("#preview-img").attr("src", $("#skin_url").val());
$("#skin_url").change(function() {
    $("#preview-img").attr("src", this.value);
});