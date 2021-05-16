const fetch = require('node-fetch');

async function kitsuHandler(kitsuID){

    const kitsuToIMDBurl = "https://raw.githubusercontent.com/TheBeastLT/stremio-kitsu-anime/master/static/data/imdb_mapping.json"

    const response = await fetch(kitsuToIMDBurl)
    const responseJSON = await response.json()
    
    if (responseJSON[kitsuID] !== undefined){

        const imdbID = responseJSON[kitsuID].imdb_id

        const imdbResponse = await fetch(`https://v2.sg.media-imdb.com/suggestion/t/${imdbID}.json`)
        const imdbResponseJSON = await imdbResponse.json()

        if(imdbResponseJSON.d[0].q === "TV series") {

            const season =  responseJSON[kitsuID].fromSeason
            const episode = responseJSON[kitsuID].fromEpisode

            return {imdbID, season, episode}

        } else {

            return {imdbID}

        }
    }
}

module.exports = kitsuHandler