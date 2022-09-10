const axios = require('axios').default;
axios.defaults.headers.get["content-type"] = "application/json";
axios.defaults.baseURL = "https://api.orionoid.com";
axios.defaults.timeout = 10000
axios.defaults.method = "GET"

async function userStatus(keyapp,keyuser){

    const params = {
        mode: "user",
        action: "retrieve",
        keyapp,
        keyuser
    }

    const responseOrionRequest = await axios({params})
    const jsonOrionRequest = responseOrionRequest.data

    if(jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "success") {
        return jsonOrionRequest.data.subscription.package.type
    }

}
module.exports = userStatus