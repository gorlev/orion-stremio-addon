const fetch = require('node-fetch');
const humanFileSize = require('./humanFileSize');
const linktoHash = require('./linkToHash');
const resNameEditor = require('./resNameEditor');

async function getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode){

    const responseOrionRequest = await fetch("https://api.orionoid.com", {
        "headers": {"content-type": "application/json"},
        "body": `{
            "keyuser": "${keyuser}",
            "keyapp": "${keyapp}",
            "mode": "stream",
            "action": "retrieve",
            "type": "show",
            "idimdb": "${idimdb}",
            "limitcount": ${limitcount},
            "videoquality": "${videoquality}",
            "audiochannels": "${audiochannels}",
            "streamtype": "torrent",
            "protocoltorrent": "magnet",
            "sortvalue": "${sortvalue}",
            "numberseason": ${numberseason},
            "numberepisode": ${numberepisode}
            }`,
    "method": "POST" 
    });
    const jsonOrionRequest = await responseOrionRequest.json()
    
    let mediaDatas = []
    
    if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status && jsonOrionRequest.result.status === "success") {
        
        for (let element of jsonOrionRequest.data.streams) {
                            
            let fileHash = element.file.hash
            const mediaName = element.file.name
            const mediaSize = humanFileSize(element.file.size)
            const packStatus = element.file.pack
            const mediaSource = element.stream.source
    
            const seederAmount = element.stream.seeds
            
            const videoquality =  resNameEditor(element.video.quality)
        
            let audioLang = element.audio.languages.join(" ").toUpperCase()
            if (audioLang === "EN") { audioLang = ""}

            const mediaLink = element.links[0]
    
            if(fileHash === null) {
                fileHash = await linktoHash(mediaLink)
            }

            if (packStatus === false) {
                mediaDatas.push({
                    'name': `Orion`,
                    'title': `${mediaName}\nSeason: ${numberseason} Episode: ${numberepisode}\n${videoquality}\t${mediaSize}\tS: ${seederAmount}\t${mediaSource}\n${audioLang}`,
                    'infoHash': fileHash,
                    'behaviorHints': {
                        'bingeGroup': `orion-torrent-${videoquality}`
                    }
                })
            } else if (packStatus === true) {
                mediaDatas.push({
                    'name': `Orion`,
                    'title': `${mediaName}\nSeason: ${numberseason} Episode: ${numberepisode}\n${videoquality}\t${mediaSize}\tS: ${seederAmount}\t${mediaSource}\n${audioLang}`,
                    'infoHash': fileHash,
                    'fileIdx': numberepisode-1,
                    'behaviorHints': {
                        'bingeGroup': `orion-torrent-${videoquality}`
                    }
                })
            }
        }
    }

    return mediaDatas
}

module.exports = getSeriesTorrents