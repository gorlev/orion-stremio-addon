const { default: axios } = require('axios');
module.exports = async function getPublicIP() {

    //Only required for local testing.
    try {
        const response = await axios({url:"https://icanhazip.com/",method:"GET", timeout:10000})
        return response.data.trim();
    }catch(e){
        console.log(e)
        return "0.0.0.0"
    }
}
