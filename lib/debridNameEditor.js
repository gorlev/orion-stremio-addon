module.exports=function debridNameEditor(name){
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
