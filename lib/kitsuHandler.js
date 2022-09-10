const { default: axios } = require('axios');

async function kitsuHandler(kitsuID){

    const kitsuToIMDBurl = "https://raw.githubusercontent.com/TheBeastLT/stremio-kitsu-anime/master/static/data/imdb_mapping.json"

    let response,responseJSON,imdbResponse,imdbResponseJSON
    try{
        response = await axios.get(kitsuToIMDBurl)
        responseJSON = response.data
    }catch(e){
        console.log(e)
    }
    
    if (responseJSON[kitsuID] !== undefined){

        const imdbID = responseJSON[kitsuID].imdb_id

        try{
            imdbResponse = await axios.get(`https://v2.sg.media-imdb.com/suggestion/t/${imdbID}.json`)
            imdbResponseJSON = imdbResponse.data
        }catch(e){
            console.log(e)
        }

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