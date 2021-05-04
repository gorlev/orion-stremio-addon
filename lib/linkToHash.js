const fetch = require('node-fetch');
require('dotenv').config({path : '../.env' })

async function linktoHash(link) {
    try{
        const api = process.env.WMASTERAPI
        
        const requestApi = await fetch(`https://api.webmasterapi.com/v1/torrent2magnet/${api}/${link}`,  {  timeout: 150 }) 
        const responseApi = await requestApi.json()
        const infoHash = responseApi.results.split(":")[3]
        return infoHash       
        
    } catch(error) {

        const infoHash = ""
        return infoHash
    }
}

module.exports = linktoHash