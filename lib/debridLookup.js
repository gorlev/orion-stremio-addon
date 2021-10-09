const fetch = require('node-fetch');
require('dotenv').config({path : '../.env' })

async function debridLookup(keyuser,service,iditem,idstream) {

    const keyapp = process.env.APP_API_KEY

    const responseDebridRequest = await fetch("https://api.orionoid.com", {
    "headers": {"content-type": "application/json"},
    "body": `{
        "keyuser": "${keyuser}",
        "keyapp": "${keyapp}",
        "mode": "debrid",
        "action": "lookup",
        "type": "${service}",
        "iditem": "${iditem}",
        "idstream":"${idstream}",
        "refresh": "true"
        }`,
    "method": "POST" 
    });

    const jsonDebridRequest = await responseDebridRequest.json()

    if(jsonDebridRequest && jsonDebridRequest.result){
        return jsonDebridRequest.result
    }
}

module.exports = debridLookup