require('dotenv').config({path : '../.env' })
const fetch = require('node-fetch');
const debridLinkResolver = require('./debridLinkResolver');
const getMovieCachedDebridLinks = require('./getMovieCachedDebridLinks');
const getMovieTorrents = require('./getMovieTorrents');
const getSeriesCachedDebridLinks = require('./getSeriesCachedDebridLinks');
const getSeriesTorrents = require('./getSeriesTorrents');
const humanFileSize = require('./humanFileSize');
const resNameEditor = require('./resNameEditor');

async function dataHandler(userConf, videoId, type, season, episode, clientIp){
    
    const userConfiguration = JSON.parse(Buffer.from(userConf, 'base64').toString())
    console.log(userConfiguration)

    //API KEYS
    const keyapp = process.env.APP_API_KEY.trim()
    const keyuser = userConfiguration.api.trim()

    //NUMBER OF LINKS TO RETRIEVE
    let limitcount = Number(userConfiguration.linkLimit.trim())

    if(limitcount > 30 && userConfiguration.debridservices.length > 0) {
        limitcount = 30
    }

    limitcount = Math.trunc(limitcount / (1 + userConfiguration.debridservices.length))
    
    if(limitcount === 0) {
        limitcount = 1
    }

    //I limited the debrid link generation due to the addon load times getting too long.
    
    //HANDLES WITH THE VIDEO QUALITY PARAMETERS FOR THE DESIRED FORMAT
    const videoquality = userConfiguration.videoquality.trim()

    //HANDLES WITH THE SORTING OPTION
    const sortvalue = userConfiguration.sortValue.trim()
    
    //HANDLES WITH THE AUDIO CHANNELS FOR THE DESIRED FORMAT
    const audiochannels = userConfiguration.audiochannels.trim()

    //Listing Option Handling
    const listOpt = userConfiguration.listOpt.trim()

    //Converts the IMDB ID for Orion
    const idimdb = videoId.substring(2) 

    //Converts the season and episode datas for Orion.
    let numberseason = Number(season)
    let numberepisode = Number(episode)

    let stremioElements = []
    let allMovieDebridLinks = []
    let allSeriesDebridLinks = []
    let movieTorrentStreams, seriesTorrentStreams, movieDebridLinks, seriesDebridLinks


    if (listOpt === "both") {

        if (type === "movie") {

            for (let debridprovider of userConfiguration.debridservices) {
                movieDebridLinks = await getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality, audiochannels,sortvalue, debridprovider, clientIp)
                allMovieDebridLinks = allMovieDebridLinks.concat(movieDebridLinks)
            }
            movieTorrentStreams = await getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue)
            stremioElements = stremioElements.concat(allMovieDebridLinks, movieTorrentStreams)
            
            return stremioElements
        
        } else if (type === "series") {

            for (let debridprovider of userConfiguration.debridservices) {
                seriesDebridLinks = await getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debridprovider,clientIp)
                allSeriesDebridLinks = allSeriesDebridLinks.concat(seriesDebridLinks)
            }
            
            seriesTorrentStreams = await getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode)
            stremioElements = stremioElements.concat(allSeriesDebridLinks, seriesTorrentStreams)
          
            return stremioElements
        }
    } else if (listOpt === "torrent") {
            
        if (type === "movie") {

            movieTorrentStreams = await getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue)

            return movieTorrentStreams
            
        } else if (type === "series") {

            seriesTorrentStreams = await getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode)

            return seriesTorrentStreams
        }

    } else if (listOpt === "debrid") {
            
        if (type === "movie") {

            for (let debridprovider of userConfiguration.debridservices) {
                movieDebridLinks = await getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality, audiochannels,sortvalue, debridprovider, clientIp)
                allMovieDebridLinks = allMovieDebridLinks.concat(movieDebridLinks)
            }

            return allMovieDebridLinks
            
        } else if (type === "series") {

            for (let debridprovider of userConfiguration.debridservices) {
                seriesDebridLinks = await getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debridprovider,clientIp)
                allSeriesDebridLinks = allSeriesDebridLinks.concat(seriesDebridLinks)
            }
            
            return allSeriesDebridLinks
        }
    }
    
}

module.exports = dataHandler;