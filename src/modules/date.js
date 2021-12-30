function getDate(){
    let unix_timestamp = Date.now() / 1000;
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0')+' ';
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd + formattedTime;
    return today
}

module.exports = getDate;