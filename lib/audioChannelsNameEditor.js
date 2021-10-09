module.exports=function audioChannelsNameEditor(name){
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
