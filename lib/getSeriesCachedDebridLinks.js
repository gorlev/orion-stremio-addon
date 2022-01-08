const fetch = require('node-fetch');
const debridLinkResolver = require('./debridLinkResolver');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');
const debridNameEditor = require('./debridNameEditor');
const config = require('../config');
const userStatus = require('./userStatus');
const audioChannelsNameEditor = require('./audioChannelsNameEditor');


async function getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debrid,clientIp,audiolanguages){
                            
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

    if (debrid === "premiumize"){
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
                "audiolanguages": ${audiolanguages},
                "sortvalue": "${sortvalue}",
                "numberseason": ${numberseason},
                "numberepisode": ${numberepisode},
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
                "type": "show",
                "streamtype": "usenet,hoster,torrent",
                "idimdb": "${idimdb}",
                "limitcount": ${limitcount},
                "videoquality": "${videoquality}",
                "audiochannels": "${audiochannels}",
                "audiolanguages": ${audiolanguages},
                "sortvalue": "${sortvalue}",
                "numberseason": ${numberseason},
                "numberepisode": ${numberepisode},
                "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
                ${debridLookupString}
                "debridresolve": "${debrid},original"
            }`,
            "method": "POST" 
        });
    }
    let jsonOrionRequest = await responseOrionRequest.json()

    let mediaDatas = []
    
    if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.count && jsonOrionRequest.data.count.retrieved > 0 ) {
       
        //let orionID = jsonOrionRequest.data.episode.id.orion
       
        for (let element of jsonOrionRequest.data.streams) {
            
            const mediaName = element.file.name
            const mediaSize = humanFileSize(element.file.size) 
            const mediaSource = element.stream.source
            
            const videoquality =  resNameEditor(element.video.quality)

            //const streamID = element.id
            //const mediaType = element.stream.type

            const debridURL = element.debrid
            const debridName = debridNameEditor(debrid)

            let audioLang = element.audio.languages.join(" ").toUpperCase()

            const videoCodec = element.video.codec
            let audioCh = element.audio.channels
            audioCh = audioChannelsNameEditor(audioCh)

            mediaDatas.push({
                'name': `🚀 ORION\n [${debridName}]`,
                'title': `${mediaName}\n📺${videoquality} 💾${mediaSize} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                'url': `${debridURL}`,
                'behaviorHints': {
                    'bingeGroup': `orion-${videoquality}-${debridName}`
                }
            })
        }
    } else if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.count && jsonOrionRequest.data.count.retrieved === 0 ){
        // || jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "error" && jsonOrionRequest.result.type === "streammissing"
        if (debrid === "premiumize"){
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
                    "audiolanguages": ${audiolanguages},
                    "sortvalue": "${sortvalue}",
                    "numberseason": ${numberseason},
                    "filepack": true,
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
                    "type": "show",
                    "streamtype": "usenet,hoster,torrent",
                    "idimdb": "${idimdb}",
                    "limitcount": ${limitcount},
                    "videoquality": "${videoquality}",
                    "audiochannels": "${audiochannels}",
                    "audiolanguages": ${audiolanguages},
                    "sortvalue": "${sortvalue}",
                    "numberseason": ${numberseason},
                    ${debridLookupString}
                    "debridresolve": "${debrid},original",
                    "access": "${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster",
                    "filepack": true
                }`,
                "method": "POST" 
            });
        }

        jsonOrionRequest = await responseOrionRequest.json()

        if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.episode && jsonOrionRequest.data.episode.id && jsonOrionRequest.data.episode.id.orion && jsonOrionRequest.data.streams !== undefined){
            let orionID = jsonOrionRequest.data.episode.id.orion
            
            for (let element of jsonOrionRequest.data.streams) {
                
                const mediaName = element.file.name
                const mediaSize = humanFileSize(element.file.size) 
                const mediaSource = element.stream.source
                
                const videoquality =  resNameEditor(element.video.quality)
                
                const  streamID = element.id
                //const mediaType = element.stream.type
                
                const debridName = debridNameEditor(debrid)
                
                let audioLang = element.audio.languages.join(" ").toUpperCase()
    
                const videoCodec = element.video.codec
                let audioCh = element.audio.channels
                audioCh = audioChannelsNameEditor(audioCh)
                
                mediaDatas.push({
                    'name': `🚀 ORION\n[${debridName}]`,
                    'title': `${mediaName}\n📺${videoquality} 💾${mediaSize} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                    'url': `${config.local}/download/${keyuser}/${debrid}/${orionID}/${streamID}/${numberepisode}`,
                    'behaviorHints': {
                        'bingeGroup': `orion-${videoquality}-${debridName}`
                    }
                })
        }
    }
    } else {
        mediaDatas = []
    }
    
    return mediaDatas
}

module.exports = getSeriesCachedDebridLinks