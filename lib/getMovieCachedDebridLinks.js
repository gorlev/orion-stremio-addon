const { resNameEditor,humanFileSize,audioChannelsNameEditor,debridNameEditor } = require('./editors');
const userStatus = require('./userStatus');
const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

async function getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue, debrid, clientIp, audiolanguages, additionalParameters){

    const userType = await userStatus(keyapp,keyuser)

    let debridName = userType === "free" ? null : debrid

    let params = {
        keyuser,
        keyapp,
        mode: "stream",
        action: "retrieve",
        type: "movie",
        streamtype: "usenet,hoster,torrent",
        idimdb,
        limitcount,
        videoquality,
        audiochannels,
        audiolanguages,
        sortvalue,
        access: `${debridName},${debridName}torrent,${debridName}usenet,${debridName}hoster`,
        debridlookup: debridName,
        debridresolve: `${debridName},original`
    }

    if (debridName === "premiumize") {params.debridresolve = `${debridName},${clientIp},original`}

    if(params !== {}){params = {...params,...additionalParameters}}


    // console.log(params)
    const responseOrionRequest = await axios({params})

    const jsonOrionRequest = responseOrionRequest.data

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

            const debridType = debridNameEditor(debrid)
        
            const debridURL = element.debrid

            // let audioLang = "[" + element.audio.languages.join(" ").toUpperCase() + "]"
            // if (audioLang === "[EN]") { audioLang = ""}
            
            let audioLang = element.audio.languages.join(" ").toUpperCase()

            const videoCodec = element.video.codec
            let audioCh = element.audio.channels
            audioCh = audioChannelsNameEditor(audioCh)

            mediaDatas.push({
                name: `🚀 ORION\n[${debridType}]`,
                title: `${mediaName}\n📺${videoquality} 💾${mediaSize} 🎥${videoCodec} 🔊${audioCh}\n👂${audioLang} ☁️${mediaSource}`,
                url: `${debridURL}`
                //'url': `${config.local}/download/${keyuser}/${debrid}/${orionID}/${streamID}`
            })
        }
    }
    return mediaDatas
}

module.exports = getMovieCachedDebridLinks