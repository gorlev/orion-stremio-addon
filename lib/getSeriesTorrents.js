const fetch = require('node-fetch');
const audioChannelsNameEditor = require('./audioChannelsNameEditor');
const humanFileSize = require('./humanFileSize');
const linktoHash = require('./linkToHash');
const resNameEditor = require('./resNameEditor');

async function getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,audiolanguages){

    if (audiolanguages !== 1) {
        audiolanguages = `"${audiolanguages}"`
    }
    
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
            "audiolanguages": ${audiolanguages},
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
            // if (audioLang === "EN") { audioLang = ""}

            const mediaLink = element.links[0]

            const videoCodec = element.video.codec
            let audioCh = element.audio.channels
            audioCh = audioChannelsNameEditor(audioCh)
            
            if(fileHash === null) {
                fileHash = await linktoHash(mediaLink)
            }

            if (packStatus === false) {
                mediaDatas.push({
                    'name': `🪐 ORION 📺 ${videoquality}`,
                    'title': `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                    'infoHash': fileHash,
                    'behaviorHints': {
                        'bingeGroup': `orion-torrent-${videoquality}`
                    }
                })
            } else if (packStatus === true) {
                mediaDatas.push({
                    'name': `🪐 ORION 📺 ${videoquality}`,
                    'title': `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                    'infoHash': fileHash,
                    'fileIdx': numberepisode-1,
                    'behaviorHints': {
                        'bingeGroup': `orion-torrent-${videoquality}`
                    }
                })
            }
        }
    } else if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "error" && jsonOrionRequest.result.type === "streammissing"){

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
                "audiolanguages": ${audiolanguages},
                "streamtype": "torrent",
                "protocoltorrent": "magnet",
                "sortvalue": "${sortvalue}",
                "numberseason": ${numberseason},
                "filepack": true
            }`,
        "method": "POST" 
        });
        const jsonOrionRequest = await responseOrionRequest.json()

        if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.streams !== undefined){
            
            for (let element of jsonOrionRequest.data.streams) {
                
                let fileHash = element.file.hash
                const mediaName = element.file.name
                const mediaSize = humanFileSize(element.file.size)
                const packStatus = element.file.pack
                const mediaSource = element.stream.source
                
                const seederAmount = element.stream.seeds
                
                const videoquality =  resNameEditor(element.video.quality)
                
                let audioLang = element.audio.languages.join(" ").toUpperCase()
                // if (audioLang === "EN") { audioLang = ""}
                
                const mediaLink = element.links[0]

                const videoCodec = element.video.codec
                let audioCh = element.audio.channels
                audioCh = audioChannelsNameEditor(audioCh)
                
                if(fileHash === null) {
                    fileHash = await linktoHash(mediaLink)
                }
                
                if (packStatus === true) {
                    mediaDatas.push({
                        'name': `🪐 ORION 📺 ${videoquality}`,
                        'title': `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                        'infoHash': fileHash,
                        'fileIdx': numberepisode-1,
                        'behaviorHints': {
                            'bingeGroup': `orion-torrent-${videoquality}`
                    }
                })
            }
        }
        
    }
}
    return mediaDatas
}

module.exports = getSeriesTorrents