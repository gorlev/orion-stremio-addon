require('dotenv').config({path : '../.env' })

const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

async function debridLookup(keyuser,service,iditem,idstream) {

    const keyapp = process.env.APP_API_KEY

    let params = {
        keyuser,
        keyapp,
        mode: "debrid",
        action: "lookup",
        type: service,
        iditem,
        idstream,
        refresh: true
    }
    const responseDebridRequest = await axios({params})
    const jsonDebridRequest = responseDebridRequest.data
    
    if(jsonDebridRequest && jsonDebridRequest.result){
        return jsonDebridRequest.result
    }else{
        return {}
    }
}

module.exports = debridLookup