const { default: axios } = require('axios');
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
