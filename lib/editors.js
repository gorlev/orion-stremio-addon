function resNameEditor(name){
    switch (name) {
        case "hd8k":
            res = "8K";
            break;
        case "hd6k":
            res = "6K";
            break;
        case "hd4k":
            res = "4K";
            break;   
        case "hd2k":
            res = "2K";
            break;
        case "hd1080":
            res = "1080P";
            break;
        case "hd720":
            res = "720P";
            break;
        case "sd":
            res = "SD";
            break;
        case "scr1080":
            res = "1080P (SCR)";
            break;
        case "scr720":
            res = "720P (SCR)";
            break;   
        case "scr":
            res = "SCR";
            break;
        case "cam1080":
            res = "1080P (CAM)";
            break;
        case "cam720":
            res = "720P (CAM)";
            break;
        case "cam":
            res = "CAM";
            break;
        default:
        res = "Error";
    }
    return res
}
function humanFileSize(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function debridNameEditor(name){
    switch (name) {
        case "premiumize":
            res = "Premiumize";
            break;
        case "realdebrid":
            res = "Real-Debrid";
            break;
        case "offcloud":
            res = "Offcloud";
            break;
        case "alldebrid":
            res = "AllDebrid";
            break;
        case "debridlink":
            res = "DebridLink";
            break;      
        default:
            res = "Error";
    }
    return res
}
function audioChannelsNameEditor(name){
    switch (name) {
        case 1:
            audio = "Mono";
            break;
        case 2:
            audio = "Stereo";
            break;
        case 6:
            audio = "5.1";
            break;
        case 8:
            audio = "7.1";
            break;
        case 10:
            audio = "9.1";
            break;          
        default:
            audio = "unknown";
    }
    return audio
}

module.exports = {resNameEditor,humanFileSize,debridNameEditor,audioChannelsNameEditor}