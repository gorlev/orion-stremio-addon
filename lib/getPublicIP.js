const fetch = require('node-fetch');
module.exports = async function getPublicIP() {

    //Only required for local testing.
    
    const response = await fetch("https://icanhazip.com/");
    let responseText = await response.text();

    responseText = responseText.trim();
    return responseText;
}
