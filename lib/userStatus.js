const fetch = require('node-fetch');

async function userStatus(keyapp,keyuser){

    const responseOrionRequest = await fetch("https://api.orionoid.com", {
        headers: {"content-type": "application/json"},
        body: `{
            "mode": "user",
            "action": "retrieve",
            "keyapp": "${keyapp}",
            "keyuser": "${keyuser}"
        }`,
        method: "POST" 
    });

    const jsonOrionRequest = await responseOrionRequest.json()

    if(jsonOrionRequest && jsonOrionRequest.result && jsonOrionRequest.result.status === "success") {
        return jsonOrionRequest.data.subscription.package.type
    }

}
module.exports = userStatus