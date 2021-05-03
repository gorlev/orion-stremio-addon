const fetch = require('node-fetch');
const debridLinkResolver = require('./debridLinkResolver');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');
const debridNameEditor = require('./debridNameEditor');


async function getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debrid,clientIp){
                                
    responseOrionRequest = await fetch("https://api.orionoid.com", {
        "headers": {"content-type": "application/json"},
        "body": `{
            "keyuser": "${keyuser}",
            "keyapp": "${keyapp}",
            "mode": "stream",
            "action": "retrieve",
            "type": "show",
            "streamtype": "usenet,hoster,torrent",
            "idimdb": "${idimdb}",
            "limitcount": ${limitcount},
            "videoquality": "${videoquality}",
            "audiochannels": "${audiochannels}",
            "sortvalue": "${sortvalue}",
            "numberseason": ${numberseason},
            "numberepisode": ${numberepisode},
            "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
            "lookup": "${debrid}"
        }`,
        "method": "POST" 
    });
    const jsonOrionRequest = await responseOrionRequest.json()

    let mediaDatas = []
   
   if(jsonOrionRequest.result.status === "success") {
       
    let orionID = jsonOrionRequest.data.episode.id.orion
       
        for (let element of jsonOrionRequest.data.streams) {
            
            const mediaName = element.file.name
            const mediaSize = humanFileSize(element.file.size) 
            const mediaSource = element.stream.source
            
            const videoquality =  resNameEditor(element.video.quality)

            const streamID = element.id

            const mediaType = element.stream.type
            const debridName = debridNameEditor(debrid)

            const debridLink = await debridLinkResolver(keyuser,debrid,orionID,streamID,clientIp)

            let debridURL;
            if (debridLink.originalLink === undefined) {
                debridURL = debridLink.streamLink
            }else {
                debridURL = debridLink.originalLink
            }

            let audioLang = "[" + element.audio.languages.join(" ").toUpperCase() + "]"

            if (audioLang === "[EN]") { audioLang = ""}

            mediaDatas.push({
                'name': `Orion Debrid \n [${debridName}]`,
                'title': `${mediaName}\nSeason: ${numberseason} Episode: ${numberepisode}\n${videoquality}\t${mediaSize}\t${mediaSource}\n${mediaType}\t${audioLang}`,
                'url': debridURL,
            })
        }
    }

    return mediaDatas
}

module.exports = getSeriesCachedDebridLinks