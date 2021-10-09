const fetch = require('node-fetch');
const audioChannelsNameEditor = require('./audioChannelsNameEditor');
const humanFileSize = require('./humanFileSize');
const linktoHash = require('./linkToHash');
const resNameEditor = require('./resNameEditor');

async function getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,audiolanguages){

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
            "type": "movie",
            "idimdb": "${idimdb}",
            "limitcount": ${limitcount},
            "videoquality": "${videoquality}",
            "audiochannels": "${audiochannels}",
            "audiolanguages": ${audiolanguages},
            "streamtype": "torrent",
            "protocoltorrent": "magnet",
            "sortvalue": "${sortvalue}"
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
        const mediaSource = element.stream.source

        const seederAmount = element.stream.seeds
        
        const videoquality =  resNameEditor(element.video.quality)

        let audioLang = element.audio.languages.join(" ").toUpperCase()
        // if (audioLang === "EN") { audioLang = ""}
        // else {audioLang === `${audioLang}`}

        const mediaLink = element.links[0]

        if (fileHash === null) {
            fileHash = await linktoHash(mediaLink)
        }

        const videoCodec = element.video.codec
        let audioCh = element.audio.channels
        audioCh = audioChannelsNameEditor(audioCh)

        mediaDatas.push({
        'name': `🪐 ORION 📺 ${videoquality}`,
        'title': `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
        'infoHash': fileHash,
        })
        }
    }
    return mediaDatas
}

module.exports = getMovieTorrents