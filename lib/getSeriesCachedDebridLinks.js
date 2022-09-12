const config = require('../config');
const userStatus = require('./userStatus');
const { resNameEditor,humanFileSize,audioChannelsNameEditor,debridNameEditor } = require('./editors');
const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

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
            // access: `${debrid},${debrid}torrent,${debrid}usenet,${debrid}hoster`,
            debridlookup: debridName,
            debridresolve: `${debrid},original`
        }

    if (debridName === "premiumize") {params.debridresolve = `${debridName},${clientIp},original`}
    
    if(params !== {}){params = {...params,...additionalParameters}}
    
    let cacheParams = {...params}
    delete cacheParams.keyuser
    delete cacheParams.keyapp

    if(myCache.has(JSON.stringify(cacheParams))){
        return myCache.get(JSON.stringify(cacheParams))
    }else{

        let responseOrionRequest,jsonOrionRequest

        try{
            responseOrionRequest = await axios({params})
            jsonOrionRequest = responseOrionRequest.data
        }catch(e){
            console.log(e)
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

        if(mediaDatas.length > 0){
            myCache.set(JSON.stringify(cacheParams), mediaDatas, 15*60) // 15 mins
        }

        return mediaDatas
    }
}

module.exports = getSeriesCachedDebridLinks