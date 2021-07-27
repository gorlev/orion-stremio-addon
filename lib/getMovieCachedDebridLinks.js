const fetch = require('node-fetch');
const config = require('../config');
const debridLinkResolver = require('./debridLinkResolver');
const debridNameEditor = require('./debridNameEditor');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');
const userStatus = require('./userStatus');

async function getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue, debrid, clientIp, audiolanguages){

    if (audiolanguages !== 1) {
        audiolanguages = `"${audiolanguages}"`
    }

    const userType = await userStatus(keyapp,keyuser)

    let debridLookupString

    if (userType === "free") {
        debridLookupString = ""
    } else {
        debridLookupString = `"debridlookup": "${debrid}",`
    }

    if (debrid === "premiumize") {
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
                "audiolanguages": ${audiolanguages},
                "sortvalue": "${sortvalue}",
                "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
                ${debridLookupString}
                "debridresolve": "${debrid},${clientIp},original"
            }`,
            "method": "POST" 
        });
    } else {
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
                "audiolanguages": ${audiolanguages},
                "sortvalue": "${sortvalue}",
                "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
                ${debridLookupString}
                "debridresolve": "${debrid},original"
            }`,
            "method": "POST" 
        });
    }

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
            //const streamID = element.id

            const debridName = debridNameEditor(debrid)
        
            const debridURL = element.debrid

            let audioLang = "[" + element.audio.languages.join(" ").toUpperCase() + "]"

            if (audioLang === "[EN]") { audioLang = ""}

            mediaDatas.push({
                'name': `Orion Debrid \n [${debridName}]`,
                'title': `${mediaName}\n${videoquality}\t${mediaSize}\t${mediaSource}\n${audioLang}`,
                'url': `${debridURL}`
                //'url': `${config.local}/download/${keyuser}/${debrid}/${orionID}/${streamID}`
            })
        }
    }
    return mediaDatas
}

module.exports = getMovieCachedDebridLinks