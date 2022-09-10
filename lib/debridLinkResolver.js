require('dotenv').config({path : '../.env' })

const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"


async function debridLinkResolver(keyuser,service,iditem,idstream,clientip,episode) {

    const keyapp = process.env.APP_API_KEY


    let links = []
    let debridlink, originalLink
    const episodeNumber = Number(episode)

    let params = {
        keyuser,
        keyapp,
        mode: "debrid",
        action: "resolve",
        type: service,
        iditem,
        idstream,
        file: "original",
        output: "list"
    }
    if (service === "premiumize") {params.ip = clientip}


    let responseRequest = await axios({params})
    responseRequest = responseRequest.data
        
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

}
module.exports = debridLinkResolver