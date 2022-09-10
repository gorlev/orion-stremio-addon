const { default: axios } = require('axios');
const fetch = require('node-fetch');

module.exports = async function getPublicIP() {

    //Only required for local testing.
    try {
        const response = await axios.get("https://api.myip.com")
        return response.data.ip;
    }catch(e){
        console.log(e)
        return "0.0.0.0"
    }
}
