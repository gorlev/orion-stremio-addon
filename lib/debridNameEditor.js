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
        default:
            res = "Error";
    }
    return res
}
