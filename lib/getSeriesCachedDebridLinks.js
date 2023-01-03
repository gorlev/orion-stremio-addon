const config = require('../config');
const userStatus = require('./userStatus');
const { resNameEditor,humanFileSize,audioChannelsNameEditor,debridNameEditor } = require('./editors');
const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

async function getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debrid,clientIp,audiolanguages,additionalParameters,orionCache){
                            
    const userType = await userStatus(keyapp,keyuser)

    let debridName = userType === "free" ? null : debrid

    let params = {
            keyuser,
            keyapp,
            mode: "stream",
            action: "retrieve",
            type: "show",
            streamtype: "usenet,hoster,torrent",
            idimdb,
            limitcount,
            videoquality,
            audiochannels,
            audiolanguages,
            sortvalue,
            numberseason,
            numberepisode,
            // access: `${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster`,
            debridlookup: debridName,
            debridresolve: `${debrid},original`,
            // deviceIP: clientIp,
            // deviceAgent: userAgent
        }

    if (debridName === "premiumize") {params.debridresolve = `${debridName},${clientIp},original`}
    
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
            return []
        }

        if (jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status && jsonOrionRequest.result.status === "error") {
            return [{
                name: `🚀 ORION`,
                title: `⚠️ ERROR! \n${jsonOrionRequest.result.description||""}\n${jsonOrionRequest.result.message||""}`,
                url: "https://github.com/gorlev/orion-stremio-addon/blob/main/videos/error-general.mp4?raw=true",
            }]
        }

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
                const debridType = debridNameEditor(debrid)


                let audioLang = element.audio.languages.join(" ").toUpperCase()

                const videoCodec = element.video.codec
                let audioCh = element.audio.channels
                audioCh = audioChannelsNameEditor(audioCh)

                mediaDatas.push({
                    name: `🚀 ORION\n [${debridType}]`,
                    title: `${mediaName}\n📺${videoquality} 💾${mediaSize} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                    url: `${debridURL}`,
                    behaviorHints: {
                        bingeGroup: `orion-${videoquality}-${debridType}`
                    }
                })
            }
        } else if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.count && jsonOrionRequest.data.count.retrieved === 0 ){
            // || jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "error" && jsonOrionRequest.result.type === "streammissing"

            params.filepack = true

            try{
                responseOrionRequest = await axios({params})
                jsonOrionRequest = responseOrionRequest.data
            }catch(e){
                console.log(e)
            }

            if (jsonOrionRequest && jsonOrionRequest.data && jsonOrionRequest.data.episode && jsonOrionRequest.data.episode.id && jsonOrionRequest.data.episode.id.orion && jsonOrionRequest.data.streams !== undefined){
                let orionID = jsonOrionRequest.data.episode.id.orion
                
                for (let element of jsonOrionRequest.data.streams) {
                    
                    const mediaName = element.file.name
                    const mediaSize = humanFileSize(element.file.size) 
                    const mediaSource = element.stream.source
                    
                    const videoquality =  resNameEditor(element.video.quality)
                    
                    const  streamID = element.id
                    //const mediaType = element.stream.type
                    
                    const debridType = debridNameEditor(debrid)
                    
                    let audioLang = element.audio.languages.join(" ").toUpperCase()
        
                    const videoCodec = element.video.codec
                    let audioCh = element.audio.channels
                    audioCh = audioChannelsNameEditor(audioCh)
                    
                    mediaDatas.push({
                        name: `🚀 ORION\n[${debridType}]`,
                        title: `${mediaName}\n📺${videoquality} 💾${mediaSize} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                        url: `${config.local}/download/${keyuser}/${debrid}/${orionID}/${streamID}/${numberepisode}`,
                        behaviorHints: {
                            bingeGroup: `orion-${videoquality}-${debridType}`
                        }
                    })
                }
            }
        } else {
            mediaDatas = []
        }

        if(mediaDatas.length > 0 && jsonOrionRequest.result.status !== "error"){
            orionCache.set(JSON.stringify(cacheParams), mediaDatas, 5*60) // 5 mins
        }

        return mediaDatas
    }
}

module.exports = getSeriesCachedDebridLinks