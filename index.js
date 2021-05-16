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


var respond = function (res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
};

var MANIFEST = {
  id: "org.community.orion",
  version: "1.3.5",
  name: "Orion",
  logo: "https://orionoid.com/web/images/logo/logo256.png",
  background: "https://orionoid.com/web/images/background/banner.jpg",
  description: "Orion Stremio Addon, allows Orion-indexed torrent, usenet and hoster links to be played on Stremio. Cached links can be played with RealDebrid, Premiumize or Offcloud. Torrents can be streamed without using any Debrid service. Orion API key is required to use this addon. Get it from panel.orionoid.com",
  types: ["movie", "series", "others"],
  resources: [
    "stream", "meta"
  ],
  catalogs: [],
  idPrefixes: ["tt", "kitsu"],
  behaviorHints: {configurable : true, configurationRequired: true }
};

addon.engine('html', require('ejs').renderFile);
// addon.set('view engine', 'html');
addon.set('views', __dirname);


addon.get("/", async function (req, res) {
  res.redirect("/configure")
});

addon.get("/:userConf?/configure", async function (req, res) {
  res.render('configure.html',{MANIFEST});
});

// addon.get("/:userConf?/configure", async function (req, res) {
//   res.sendFile(path.join(__dirname+'/configure.html'));
// });

addon.get('/manifest.json', async function (req, res) {
  const newManifest = { ...MANIFEST };
    newManifest.behaviorHints.configurationRequired = true;
    respond(res, newManifest);
  }
);

addon.get('/:userConf/manifest.json', async function (req, res) {
  const newManifest = { ...MANIFEST };
  if (!((req || {}).params || {}).userConf) {
        newManifest.behaviorHints.configurationRequired = true;
        respond(res, newManifest);
    } else {
        newManifest.behaviorHints.configurationRequired = false;
        respond(res, newManifest);
  }
});

const nrOfDays = (nr) => nr * (24 * 3600);

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
  
  respond(res, { streams: stream, cacheMaxAge: nrOfDays(stream.length > 0 ? 7 : 1), staleRevalidate: nrOfDays(2), staleError: nrOfDays(7) });
});

addon.get('/download/:keyuser/:service/:iditem/:idstream', async function (req, res) {

  let keyuser = req.params.keyuser
  let service = req.params.service
  let iditem = req.params.iditem
  let idstream = req.params.idstream
  let clientIp = requestIp.getClientIp(req);

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  } //Only for local testing.

  debridLink = await debridLinkResolver(keyuser,service,iditem,idstream,clientIp)

  if (debridLink.originalLink === undefined) {
    res.redirect(debridLink.streamLink)
  }else {
    res.redirect(debridLink.originalLink)
  }
});

addon.get('/serverip', async function (req, res) {
  const publicIP = await getPublicIP();
  res.send(publicIP);
});

if (module.parent) {
  module.exports = addon,MANIFEST;
} else {
  addon.listen( config.port, function () {
  console.log(config)

  // const publicIP = await getPublicIP()
  // console.log(`Public IP of the remote server: ${publicIP}`)


  // addon.listen(process.env.PORT || 3634, function () {
  // console.log(`Add-on Repository URL: http://127.0.0.1:3634/manifest.json`);
  });
}