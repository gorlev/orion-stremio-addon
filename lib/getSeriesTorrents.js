const { resNameEditor,humanFileSize,audioChannelsNameEditor } = require('./editors');
const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"
const config = require('../config');

async function getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,audiolanguages,additionalParameters,orionCache){

    let params = {
        keyuser,
        keyapp,
        mode: "stream",
        action: "retrieve",
        type: "show",
        idimdb,
        limitcount,
        videoquality,
        audiochannels,
        audiolanguages,
        streamtype: "torrent",
        protocoltorrent: "magnet",
        sortvalue,
        numberseason,
        numberepisode
    }

    if(params !== {}){params = {...params,...additionalParameters}}

    let cacheParams = {...params}
    delete cacheParams.keyapp

    if(orionCache.has(JSON.stringify(cacheParams))){
        return orionCache.get(JSON.stringify(cacheParams))
    }else{

        let responseOrionRequest,jsonOrionRequest

        try{
            responseOrionRequest = await axios({params})
            jsonOrionRequest = responseOrionRequest.data
        }catch(e){
            console.log(e)
        }

        if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status && jsonOrionRequest.result.status === "error") {
            return [{
                name: `🪐 ORION`,
                title: `⚠️ ERROR! \n${jsonOrionRequest.result.description||""}\n${jsonOrionRequest.result.message||""}`,
                url: "https://github.com/gorlev/orion-stremio-addon/blob/main/videos/error-general.mp4?raw=true",
            }]
        }

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
                
                if(fileHash !== null){

                    if (packStatus === false) {
                        mediaDatas.push({
                            name: `🪐 ORION 📺 ${videoquality}`,
                            title: `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                            infoHash: fileHash,
                            behaviorHints: {
                                bingeGroup: `orion-torrent-${videoquality}`
                            }
                        })
                    } else if (packStatus === true) {
                        mediaDatas.push({
                            name: `🪐 ORION 📺 ${videoquality}`,
                            title: `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                            infoHash: fileHash,
                            fileIdx: numberepisode-1,
                            behaviorHints: {
                                bingeGroup: `orion-torrent-${videoquality}`
                            }
                        })
                    }
                }
            }
        } else if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "error" && jsonOrionRequest.result.type === "streammissing"){

            params.filepack = true

            try{
                responseOrionRequest = await axios({params})
                jsonOrionRequest = responseOrionRequest.data        
            }catch(e){
                console.log(e)
            }

            if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.streams !== undefined){
                
                for (let element of jsonOrionRequest.data.streams) {
                    
                    let fileHash = element.file.hash
                    const mediaName = element.file.name
                    const mediaSize = humanFileSize(element.file.size)
                    const packStatus = element.file.pack
                    const mediaSource = element.stream.source
                    
                    const seederAmount = element.stream.seeds
                    
                    const videoquality =  resNameEditor(element.video.quality)
                    
                    let audioLang = element.audio.languages.join(" ").toUpperCase() || null
                    // if (audioLang === "EN") { audioLang = ""}
                    
                    const mediaLink = element.links[0]

                    const videoCodec = element.video.codec
                    let audioCh = element.audio.channels
                    audioCh = audioChannelsNameEditor(audioCh)
                    
                    if(fileHash !== null){

                        if (packStatus === true) {
                            mediaDatas.push({
                                name: `🪐 ORION 📺 ${videoquality}`,
                                title: `${mediaName}\n💾${mediaSize} 👤${seederAmount} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                                infoHash: fileHash,
                                fileIdx: numberepisode-1,
                                behaviorHints: {
                                    bingeGroup: `orion-torrent-${videoquality}`
                                }
                            })
                        }
                    }
                } 
            }
        }

        if(mediaDatas.length > 0 && jsonOrionRequest.result.status !== "error"){
            orionCache.set(JSON.stringify(cacheParams), mediaDatas, 15*60) // 15 mins
        }

        return mediaDatas
    }
}

module.exports = getSeriesTorrents