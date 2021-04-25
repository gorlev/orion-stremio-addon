module.exports=function resNameEditor(name){
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
