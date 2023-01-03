const express = require("express");
require('dotenv').config({ path: `${__dirname}/.env`});
const dataHandler = require('./lib/dataHandler');
const requestIp = require('request-ip');
const getPublicIP = require("./lib/getPublicIP");
const debridLinkResolver = require("./lib/debridLinkResolver");
const config = require("./config.js");
const kitsuHandler = require("./lib/kitsuHandler");
const MANIFEST = require("./lib/manifest")
const { catalogHandler, searchCatalogHandler } = require("./lib/catalogHandler");

const { v5: uuidv5 } = require('uuid');
const addon = express();
addon.set('trust proxy', Number(process.env.TRUST_PROXY_NUMBER) || 1)

var respond = function (res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
};

const CACHE_MAX_AGE = 4 * 60 * 60; // 4 hours in seconds
const STALE_REVALIDATE_AGE = 4 * 60 * 60; // 4 hours
const STALE_ERROR_AGE = 7 * 24 * 60 * 60; // 7 days

addon.engine('html', require('ejs').renderFile);
// addon.set('view engine', 'html');
addon.set('views', __dirname);

addon.get("/", function (req, res) {
  res.redirect("/configure")
});

addon.get("/:userConf?/configure", function (req, res) {
  const newManifest = { ...{MANIFEST} };
  res.render('configure.html',newManifest);
  // res.render('configure.html',{MANIFEST});
});

addon.get('/manifest.json', function (req, res) {
  const newManifest = { ...MANIFEST };
    newManifest.behaviorHints.configurationRequired = true;
    respond(res, newManifest);
  }
);

addon.get('/:userConf/manifest.json', function (req, res) {
  const newManifest = { ...MANIFEST };
  if (!((req || {}).params || {}).userConf) {
    newManifest.behaviorHints.configurationRequired = true;
    respond(res, newManifest);
  } else {
    newManifest.behaviorHints.configurationRequired = false;
    respond(res, newManifest);
  }
});

addon.get('/:userConf/stream/:type/:id.json', async function (req, res) {
  let {userConf,type,id} = req.params
  let videoId = id.split(":")[0]
  let season = id.split(":")[1]
  let episode = id.split(":")[2]
  let clientIp = requestIp.getClientIp(req);

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  } //Only for local testing.

  if (id.includes("kitsu")) {

    let kitsuID = id.split(":")[1]
    let responseKitsuHandler = await kitsuHandler(kitsuID)

    if(responseKitsuHandler !== undefined){
      videoId = responseKitsuHandler.imdbID
      season = responseKitsuHandler.season || 1
    }
  }

  // const userAPI = JSON.parse(Buffer.from(userConf, 'base64').toString()).api
  
  // let headers = req.headers
  // delete headers["if-none-match"]

  // const client = {   
  //   apiKey: userAPI,
  //   headers: req.headers,
  //   userIP: clientIp
  // }

  const stream = await dataHandler(userConf, videoId, type, season, episode, clientIp)
  return respond(res, { streams: stream, cacheMaxAge: stream.length > 0 ? CACHE_MAX_AGE : 5 * 60 , staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE });

});


addon.get('/:userConf/catalog/:type/:id/:extra?.json', async function (req, res) {
  let {userConf,type,id,extra} = req.params
  let extraObj, userConfiguration

  try {
    userConfiguration = JSON.parse(Buffer.from(userConf, 'base64').toString())
  } catch (error) {
    console.log(error)
    return []
  }

  if(extra){
    try {
      extraObj =  JSON.parse('{"' + decodeURI(extra.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
    } catch (error) {
      console.log(error)
      return []
    }
  }
  
  if(extraObj && extraObj.genre && extraObj.genre.includes("+")){
    extraObj.genre = extraObj.genre.replace(/\+/g,' ')
  }

  let pagination
  if(extraObj && extraObj.skip){
    pagination =  extra.skip || 1
    pagination = Math.round((Number(extraObj.skip) / 16) + 1 )
  }

  let metas = []
  metas = await catalogHandler(extraObj.genre,userConfiguration.api,pagination,type)
    
  if(extraObj && extraObj.search){
    metas = await searchCatalogHandler(extraObj.search,userConfiguration.api,pagination,type)
  }

  respond(res, {metas: metas, cacheMaxAge: metas.length > 0 ? CACHE_MAX_AGE : 5 * 60 , staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE})
});

addon.get('/download/:keyuser/:service/:iditem/:idstream/:episodenumber?',async function (req, res) {
  let {keyuser,service,iditem,idstream,episodenumber} = req.params
  let clientIp = requestIp.getClientIp(req);

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  } //Only for local testing.

  let debridLink = await debridLinkResolver(keyuser,service,iditem,idstream,clientIp,episodenumber)
  if(debridLink === "error" || "" || undefined){
    const video = `${__dirname}/videos/error.mp4`;
    res.download(video);
  }
  else if (debridLink === "busy"){
    const video = `${__dirname}/videos/download-started.mp4`;
    res.download(video);
  }else{
    res.redirect(debridLink)  
  }
});


addon.get('/serverip', async function (req, res) {
  const publicIP = await getPublicIP();
  res.send(publicIP);
  res.end()
});

addon.get('*', function(req, res){
  res.redirect("/")
});

if (module.parent) {
  module.exports = addon,MANIFEST;
} else {
  addon.listen( config.port, function () {
  console.log(config)
  });
}