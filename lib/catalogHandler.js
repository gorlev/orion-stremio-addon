const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

require('dotenv').config({path : '../.env' })
const keyapp = process.env.APP_API_KEY

function genreNameEditor(name){
    switch (name) {
        case "New Releases":
            res = {category:"list", query:"new"};
            break;
        case "Disc Releases":
            res = {category:"list", query:"disc"};
            break;
        case "Top Rated":
            res = {category:"list", query:"rated"};
            break;
        case "Must Watch":
            res = {category:"list", query:"best"};
            break;
        case "Award Winner":
            res = {category:"list", query:"award"};
            break;
        case "Most Popular":
            res = {category:"popular", query:""};
            break;
        case "Now Trending":
            res = {category:"trending", query:""};
            break; 
        case "Box Office":
            res = {category:"boxoffice", query:""};
            break;
        case "New Seasons":
            res = {category:"releases", query:""};
            break;
        case "New Episodes":
            res = {category:"calendar", query:""};
            break; 
        default:
            res = "Error";
    }
    return res
}

async function catalogHandler(tag,keyuser,page,type,requestType,query) {

    let orionType = type
    if(type == "series"){orionType = "show"}

    let params 
    
    let searchParameters = genreNameEditor(tag)

    params = {
        action:"search",
        category:searchParameters.category,
        keyapp,
        keyuser,
        mode: "stream",
        page,
        query:searchParameters.query,
        type:orionType
    }
    
    let responseOrionRequest

    try {
        responseOrionRequest = await axios({params})       
    } catch (error) {
        console.log(error)
        return []
    }

    let catalog = []
    if (responseOrionRequest.data && responseOrionRequest.data.result && responseOrionRequest.data.result.status && responseOrionRequest.data.result.status === "success") {

        responseOrionRequest.data.data.forEach(i => {

            let id = "tt" + i.id.imdb
            let name = i.meta.title
            let poster = i.image.poster + "/small/background"
            let genres = i.meta.genres
            let releaseInfo = i.meta.year
            let description = i.meta.overview
            
            catalog.push({id,type,name,poster,genres,releaseInfo,description})
        });
    }

    return catalog
}

async function searchCatalogHandler(query,keyuser,page,type) {
    
    let orionType = type
    if(type == "series"){orionType = "show"}

    let params = {
        action:"search",
        category:"search",
        keyapp,
        keyuser,
        mode: "stream",
        page,
        query,
        type:"movie,show,episode"
    }

    let responseOrionRequest

    try {
        responseOrionRequest = await axios({params})       
    } catch (error) {
        console.log(error)
        return []
    }

    let catalog = []
    if (responseOrionRequest.data && responseOrionRequest.data.result && responseOrionRequest.data.result.status && responseOrionRequest.data.result.status === "success") {

        responseOrionRequest.data.data.forEach(i => {

            if(orionType === i.type){

                let id = "tt" + i.id.imdb
                let name = i.meta.title
                let poster = i.image.poster + "/small/background"
                let genres = i.meta.genres
                let releaseInfo = i.meta.year
                let description = i.meta.overview
                
                catalog.push({id,type,name,poster,genres,releaseInfo,description})
            }
        });

        return catalog
    }
}
module.exports = {catalogHandler,searchCatalogHandler}