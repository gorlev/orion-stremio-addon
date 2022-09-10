const express = require("express");
const addon = express();
const path = require('path');
require('dotenv').config();
const dataHandler = require('./lib/dataHandler');
const requestIp = require('request-ip');
const getPublicIP = require("./lib/getPublicIP");
const debridLinkResolver = require("./lib/debridLinkResolver");
const config = require("./config");
const kitsuHandler = require("./lib/kitsuHandler");
const MANIFEST = require("./lib/manifest")


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


addon.get("/", async function (req, res) {
  res.redirect("/configure")
});

addon.get("/:userConf?/configure", function (req, res) {
  res.render('configure.html',{MANIFEST});
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

// const nrOfDays = (nr) => nr * (24 * 3600);

addon.get('/:userConf/stream/:type/:id.json', async function (req, res) {

  let userConf = req.params.userConf
  let videoId =  req.params.id.split(":")[0]
  let type = req.params.type
  let season = req.params.id.split(":")[1]
  let episode = req.params.id.split(":")[2]
  let clientIp = requestIp.getClientIp(req);

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  } //Only for local testing.

  if (req.params.id.includes("kitsu")) {

    let kitsuID = req.params.id.split(":")[1]
    let responseKitsuHandler = await kitsuHandler(kitsuID)

    if(responseKitsuHandler !== undefined){
      videoId = responseKitsuHandler.imdbID
      season = responseKitsuHandler.season || 1
    }
  }

  const stream = await dataHandler(userConf, videoId, type, season, episode, clientIp)
  respond(res, { streams: stream, cacheMaxAge: stream.length > 0 ? CACHE_MAX_AGE : 5 * 60 , staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE });
});

addon.get('/download/:keyuser/:service/:iditem/:idstream/:episodenumber', async function (req, res) {

  let keyuser = req.params.keyuser
  let service = req.params.service
  let iditem = req.params.iditem
  let idstream = req.params.idstream
  let episodenumber = req.params.episodenumber

  let clientIp = requestIp.getClientIp(req);

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  } //Only for local testing.

  debridLink = await debridLinkResolver(keyuser,service,iditem,idstream,clientIp,episodenumber)

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

if (module.parent) {
  module.exports = addon,MANIFEST;
} else {
  addon.listen( config.port, function () {
  console.log(config)
  });
}