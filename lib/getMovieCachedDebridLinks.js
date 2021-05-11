const fetch = require('node-fetch');
const debridLinkResolver = require('./debridLinkResolver');
const debridNameEditor = require('./debridNameEditor');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');

async function getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue, debrid, clientIp){

    responseOrionRequest = await fetch("https://api.orionoid.com", {
        "headers": {"content-type": "application/json"},
        "body": `{
            "keyuser": "${keyuser}",
            "keyapp": "${keyapp}",
            "mode": "stream",
            "action": "retrieve",
            "type": "movie",
            "streamtype": "usenet,hoster,torrent",
            "idimdb": "${idimdb}",
            "limitcount": ${limitcount},
            "videoquality": "${videoquality}",
            "audiochannels": "${audiochannels}",
            "sortvalue": "${sortvalue}",
            "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
            "lookup": "${debrid}"
        }`,
        "method": "POST" 
    });
    const jsonOrionRequest = await responseOrionRequest.json()

    let mediaDatas = []
        
    if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status && jsonOrionRequest.result.status === "success") {
        
        let orionID = jsonOrionRequest.data.movie.id.orion

        for (let element of jsonOrionRequest.data.streams) {
            
            const mediaName = element.file.name
            const mediaSize = humanFileSize(element.file.size)
            const mediaSource = element.stream.source
            
            const videoquality =  resNameEditor(element.video.quality)

            //const mediaType = element.stream.type

            const debridName = debridNameEditor(debrid)
        
            const streamID = element.id

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
                'title': `${mediaName}\n${videoquality}\t${mediaSize}\t${mediaSource}\n${audioLang}`,
                'url': debridURL,
            })
        }
    }
    return mediaDatas
}

module.exports = getMovieCachedDebridLinks