const { resNameEditor,humanFileSize,audioChannelsNameEditor } = require('./editors');
const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"
async function getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,audiolanguages,additionalParameters){

    let params = {
        keyuser,
        keyapp,
        mode: "stream",
        action: "retrieve",
        type: "movie",
        idimdb,
        limitcount,
        videoquality,
        audiochannels,
        audiolanguages,
        streamtype: "torrent",
        protocoltorrent: "magnet",
        sortvalue
    }

    if(params !== {}){params = {...params,...additionalParameters}}

    const responseOrionRequest = await axios({params})
    const jsonOrionRequest = responseOrionRequest.data

    let mediaDatas = []

    if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status && jsonOrionRequest.result.status === "success") {

        for (let element of jsonOrionRequest.data.streams) {
            
            let fileHash = element.file.hash
            const mediaName = element.file.name
            const mediaSize = humanFileSize(element.file.size)
            const mediaSource = element.stream.source

            const seederAmount = element.stream.seeds
            
            const videoquality =  resNameEditor(element.video.quality)

            let audioLang = element.audio.languages.join(" ").toUpperCase() || null
            // if (audioLang === "EN") { audioLang = ""}
            // else {audioLang === `${audioLang}`}

            const mediaLink = element.links[0]

            if (fileHash !== null) {
                
                const videoCodec = element.video.codec
                let audioCh = element.audio.channels
                audioCh = audioChannelsNameEditor(audioCh)
                
                mediaDatas.push({
                    name: `🪐 ORION 📺 ${videoquality}`,
                    title: `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                    infoHash: fileHash,
                })
            }
        }
    }
    return mediaDatas
}

module.exports = getMovieTorrents