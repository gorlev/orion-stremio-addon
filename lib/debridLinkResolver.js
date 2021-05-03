const fetch = require('node-fetch');
require('dotenv').config({path : '../.env' })

async function debridLinkResolver(keyuser,service,iditem,idstream,clientip) {

    const keyapp = process.env.APP_API_KEY
    try {

        if (service === "premiumize"){
            const responsePremiumizeRequest = await fetch("https://api.orionoid.com", {
                "headers": {"content-type": "application/json"},
                "body": `{
                    "keyuser": "${keyuser}",
                    "keyapp": "${keyapp}",
                    "mode": "service",
                    "action": "download",
                    "service": "${service}",
                    "iditem": "${iditem}",
                    "idstream":"${idstream}",
                    "ip": "${clientip}"
                }`,
                "method": "POST" 
            });
            const jsonPremiumizeRequest = await responsePremiumizeRequest.json()

                let originalLink, streamLink
                
                jsonPremiumizeRequest.data.files.forEach(element => {
                    if(element.choice === true) {
                        originalLink = element.original.link
                        streamLink = element.stream.link
                    }
                });
                
                return {originalLink, streamLink}
                
            } else {
        
                const responseDebridRequest = await fetch("https://api.orionoid.com", {
            "headers": {"content-type": "application/json"},
            "body": `{
                "keyuser": "${keyuser}",
                "keyapp": "${keyapp}",
                "mode": "service",
                "action": "download",
                "service": "${service}",
                "iditem": "${iditem}",
                "idstream":"${idstream}"
            }`,
            "method": "POST" 
        });
        
            const jsonDebridRequest = await responseDebridRequest.json()
            let originalLink, streamLink
            
            jsonDebridRequest.data.files.forEach(element => {
                if(element.choice === true) {
                    originalLink = element.original.link
                    streamLink = element.stream.link
                }
            });
            
            return {originalLink, streamLink}
        }
    } catch(e) {
        return link = []
    }

}

module.exports = debridLinkResolver
