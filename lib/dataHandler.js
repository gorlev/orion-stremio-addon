require('dotenv').config({path : '../.env' })
const fetch = require('node-fetch');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');

async function dataHandler(userConf, videoId, type, season, episode){
    
    const userConfiguration = JSON.parse(Buffer.from(userConf, 'base64').toString())

    //API KEYS
    const keyapp = process.env.APP_API_KEY.trim()
    const keyuser = userConfiguration.api.trim()

    //NUMBER OF LINKS TO RETRIEVE
    const limitcount = Number(userConfiguration.linkLimit.trim())

    //HANDLES WITH THE VIDEO QUALITY PARAMETERS FOR THE DESIRED FORMAT
    const minQuality = userConfiguration.minQuality.trim()
    const maxQuality = userConfiguration.maxQuality.trim()
    const videoquality = `${minQuality}_${maxQuality}`

    //HANDLES WITH THE SORTING OPTION
    const sortvalue = userConfiguration.sortValue.trim()
    
    //HANDLES WITH THE AUDIO CHANNELS FOR THE DESIRED FORMAT
    const minAudio = userConfiguration.minAudio.trim()
    let audiochannels
    if (minAudio !== "8") {
        audiochannels = `${minAudio}_8`
    } else {
        audiochannels = minAudio
    }

    //Converts the IMDB ID for Orion
    const idimdb = videoId.substring(2) 

    //Converts the type for Orion
    if (type === "movie") {
        type = "movie"
    } else if (type === "series") {
        type = "show"
    }

    //Converts the season and episode datas for Orion.
    const numberseason = Number(season)
    const numberepisode = Number(episode)

    //console.log(idimdb, type, numberseason, numberepisode)
    //console.log(keyapp, keyuser, limitcount, videoquality, sortvalue, audiochannels)
    
    const responseOrionRequest = await fetch("https://api.orionoid.com", {
    "headers": {"content-type": "application/x-www-form-urlencoded"},
    "body": `keyuser=${keyuser}&keyapp=${keyapp}&mode=stream&action=retrieve&type=${type}&idimdb=${idimdb}&limitcount=${limitcount}&videoquality=${videoquality}&streamtype=torrent&sortvalue=${sortvalue}&numberseason=${numberseason}&numberepisode=${numberepisode}`,
    "method": "POST" 
    });

    const jsonOrionRequest = await responseOrionRequest.json()
    
    //console.log(jsonOrionRequest.data.streams)

    let mediaDatas = []

    jsonOrionRequest.data.streams.forEach(element => {
        
        const fileHash = element.file.hash
        const mediaName = element.file.name
        const mediaSize = humanFileSize(element.file.size)
        const packStatus = element.file.pack
        const mediaSource = element.stream.source

        const seederAmount = element.stream.seeds

        const videoquality =  resNameEditor(element.video.quality)
        
        let audioLang = element.audio.languages.join(" ").toUpperCase()
        if (audioLang === "EN") { audioLang = ""}

        if (type === "movie") {
            mediaDatas.push({
                'name': `Orion`,
                'title': `${mediaName}\n${videoquality}\t${mediaSize}\tS: ${seederAmount}\t${mediaSource}\n${audioLang}`,
                'infoHash': fileHash,
            })
        } else if (type === "show" && packStatus === false) {
            mediaDatas.push({
                'name': `Orion`,
                'title': `${mediaName}\nSeason: ${numberseason} Episode: ${numberepisode}\n${videoquality}\t${mediaSize}\tS: ${seederAmount}\t${mediaSource}\n${audioLang}`,
                'infoHash': fileHash,
            })
        } else if (type === "show" && packStatus === true) {
            mediaDatas.push({
                'name': `Orion`,
                'title': `${mediaName}\nSeason: ${numberseason} Episode: ${numberepisode}\n${videoquality}\t${mediaSize}\tS: ${seederAmount}\t${mediaSource}\n${audioLang}`,
                'infoHash': fileHash,
                'fileIdx': numberepisode-1,
            })
        }
    });
    
    //console.log(mediaDatas)

    return mediaDatas
}

module.exports = dataHandler;