const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');
const debridNameEditor = require('./debridNameEditor');
const config = require('../config');
const userStatus = require('./userStatus');
const audioChannelsNameEditor = require('./audioChannelsNameEditor');

const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

async function getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debrid,clientIp,audiolanguages,additionalParameters){
                            
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
            access: `${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster`,
            debridlookup: debridName,
            debridresolve: `${debrid},original`
        }

    if (debridName === "premiumize") {params.debridresolve = `${debridName},${clientIp},original`}
    
    if(params !== {}){params = {...params,...additionalParameters}}
    
    
    const responseOrionRequest = await axios({params})
    const jsonOrionRequest = responseOrionRequest.data
    
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
        const responseOrionRequest = await axios({params})
        const jsonOrionRequest = responseOrionRequest.data

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
    
    return mediaDatas
}

module.exports = getSeriesCachedDebridLinks