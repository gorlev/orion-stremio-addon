require('dotenv').config({path : '../.env' })
const getMovieCachedDebridLinks = require('./getMovieCachedDebridLinks');
const getMovieTorrents = require('./getMovieTorrents');
const getSeriesCachedDebridLinks = require('./getSeriesCachedDebridLinks');
const getSeriesTorrents = require('./getSeriesTorrents');

const NodeCache = require( "node-cache" );
const orionCache = new NodeCache({ stdTTL: 15*60, checkperiod: 5*60 });

async function dataHandler(userConf, videoId, type, season, episode, clientIp, userAgent){
    
    const userConfiguration = JSON.parse(Buffer.from(userConf, 'base64').toString())

    //API KEYS
    const keyapp = process.env.APP_API_KEY.trim()
    const keyuser = userConfiguration.api

    //Listing Option Handling
    const listOpt = userConfiguration.listOpt.trim()

    //NUMBER OF LINKS TO RETRIEVE
    let limitcount = Number(userConfiguration.linkLimit.trim())

    if(listOpt !== "debrid"){
        limitcount = Math.trunc(limitcount / (1 + userConfiguration.debridservices.length))
    }
    
    if(limitcount === 0) {
        limitcount = 1
    }
    
    //HANDLES WITH THE VIDEO QUALITY PARAMETERS FOR THE DESIRED FORMAT
    const videoquality = userConfiguration.videoquality.trim()

    //HANDLES WITH THE SORTING OPTION
    const sortvalue = userConfiguration.sortValue.trim()
    
    //HANDLES WITH THE AUDIO CHANNELS FOR THE DESIRED FORMAT
    const audiochannels = userConfiguration.audiochannels.trim()

    //Converts the IMDB ID for Orion
    const idimdb = videoId.substring(2) 

    //Converts the season and episode datas for Orion.
    let numberseason = Number(season)
    let numberepisode = Number(episode)

    let stremioElements = []
    let allMovieDebridLinks = []
    let allSeriesDebridLinks = []
    let movieTorrentStreams, seriesTorrentStreams, movieDebridLinks, seriesDebridLinks


    //Handles with audio languages
    let audiolanguages = userConfiguration.audiolanguages.join(",") || null

    // Gets the additional parameters as an object.
    let additionalParameters = {}

    try {
        if(userConfiguration && userConfiguration.additionalParameters && userConfiguration.additionalParameters.trim().length > 0){
            additionalParameters =  JSON.parse('{"' + decodeURI(userConfiguration.additionalParameters.trim().replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}') || {}
        }
    } catch (error) {
        console.log(error)
    }

    if (listOpt === "both") {

        if (type === "movie") {

            for (let debridprovider of userConfiguration.debridservices) {
                movieDebridLinks = await getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality, audiochannels,sortvalue, debridprovider, clientIp, audiolanguages,additionalParameters,orionCache, userAgent)
                allMovieDebridLinks = allMovieDebridLinks.concat(movieDebridLinks)
            }
            movieTorrentStreams = await getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,audiolanguages,additionalParameters,orionCache)
            stremioElements = stremioElements.concat(allMovieDebridLinks, movieTorrentStreams)
            
            return stremioElements
        
        } else if (type === "series") {

            for (let debridprovider of userConfiguration.debridservices) {
                seriesDebridLinks = await getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debridprovider,clientIp,audiolanguages,additionalParameters,orionCache, userAgent)
                allSeriesDebridLinks = allSeriesDebridLinks.concat(seriesDebridLinks)
            }
            
            seriesTorrentStreams = await getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,audiolanguages,additionalParameters,orionCache)
            stremioElements = stremioElements.concat(allSeriesDebridLinks, seriesTorrentStreams)
          
            return stremioElements
        }
    } else if (listOpt === "torrent") {
            
        if (type === "movie") {

            movieTorrentStreams = await getMovieTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,audiolanguages,additionalParameters,orionCache)

            return movieTorrentStreams
            
        } else if (type === "series") {

            seriesTorrentStreams = await getSeriesTorrents(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,audiolanguages,additionalParameters,orionCache)

            return seriesTorrentStreams
        }

    } else if (listOpt === "debrid") {
            
        if (type === "movie") {

            for (let debridprovider of userConfiguration.debridservices) {
                movieDebridLinks = await getMovieCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality, audiochannels,sortvalue, debridprovider, clientIp,audiolanguages,additionalParameters,orionCache,userAgent)
                allMovieDebridLinks = allMovieDebridLinks.concat(movieDebridLinks)
            }

            return allMovieDebridLinks
            
        } else if (type === "series") {

            for (let debridprovider of userConfiguration.debridservices) {
                seriesDebridLinks = await getSeriesCachedDebridLinks(keyuser,keyapp,idimdb,limitcount,videoquality,audiochannels,sortvalue,numberseason,numberepisode,debridprovider,clientIp,audiolanguages,additionalParameters,orionCache,userAgent)
                allSeriesDebridLinks = allSeriesDebridLinks.concat(seriesDebridLinks)
            }
            
            return allSeriesDebridLinks
        }
    }
    
}

module.exports = dataHandler;