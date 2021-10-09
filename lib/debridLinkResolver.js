const fetch = require('node-fetch');
const debridLookup = require('./debridLookup');
require('dotenv').config({path : '../.env' })

async function debridLinkResolver(keyuser,service,iditem,idstream,clientip,episode) {

    const keyapp = process.env.APP_API_KEY

    try {

        let links = []
        let debridlink, originalLink, responseRequest
        const episodeNumber = Number(episode)

        if (service === "premiumize"){
            const responsePremiumizeRequest = await fetch("https://api.orionoid.com", {
                "headers": {"content-type": "application/json"},
                "body": `{
                    "keyuser": "${keyuser}",
                    "keyapp": "${keyapp}",
                    "mode": "debrid",
                    "action": "resolve",
                    "type": "${service}",
                    "iditem": "${iditem}",
                    "idstream":"${idstream}",
                    "ip": "${clientip}",
                    "file": "original",
                    "output": "list"
                }`,
                "method": "POST" 
            });
            responseRequest = await responsePremiumizeRequest.json()
                
        } else {
        
            const responseDebridRequest = await fetch("https://api.orionoid.com", {
            "headers": {"content-type": "application/json"},
            "body": `{
                "keyuser": "${keyuser}",
                "keyapp": "${keyapp}",
                "mode": "debrid",
                "action": "resolve",
                "type": "${service}",
                "iditem": "${iditem}",
                "idstream":"${idstream}",
                "file": "original",
                "output": "list"
                }`,
            "method": "POST" 
            });
        
            responseRequest = await responseDebridRequest.json()

        }

        if(responseRequest && responseRequest.result && responseRequest.result.status === "success" && responseRequest.result.type === "debridbusy"){
            return originalLink = "busy"
        }

        responseRequest.data.files.forEach(element => {
            if(element.original.category === "video") {
                debridlink = element.original.link
                links.push(debridlink)
            }
        })

        if(links.length > 0 && episodeNumber <= links.length){

            return originalLink = await links[episodeNumber-1]

        } else if(links.length > episodeNumber){

            return originalLink = "error"
        
        }
                        
    } catch(e) {
        return link = ""
    }

}
module.exports = debridLinkResolver