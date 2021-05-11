const express = require("express");
const addon = express();
const path = require('path');
require('dotenv').config();
const dataHandler = require('./lib/dataHandler');
const requestIp = require('request-ip');
const getPublicIP = require("./lib/getPublicIP");
const { publishToCentral } = require("stremio-addon-sdk");

var respond = function (res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
};

var MANIFEST = {
  id: "org.community.orion",
  version: "1.2.8",
  name: "Orion",
  logo: "https://orionoid.com/web/images/logo/logo256.png",
  description: "Orion Stremio Addon, allows Orion-indexed torrent, usenet and hoster links to be played on Stremio. Cached links can be played with RealDebrid, Premiumize or Offcloud. Torrents can be streamed without using any Debrid service. Orion API key is required to use this addon. Get it from panel.orionoid.com",
  types: ["movie", "series"],
  resources: [
    "stream"
  ],
  catalogs: [],
  idPrefixes: ["tt"],
  behaviorHints: {configurable : true, configurationRequired: true }
};

addon.get("/", async function (req, res) {
  res.redirect("/configure")
});

addon.get("/manifest.json", async function (req, res) {
  respond(res, MANIFEST);
});

addon.get("/:userConf?/configure", async function (req, res) {
  res.sendFile(path.join(__dirname+'/configure.html'));
});

// addon.get('/:userConf/manifest.json', async function (req, res) {

//   if (typeof req.params.userConf === "undefined") {
// 		MANIFEST.behaviorHints.configurationRequired = true;
// 		respond(res, MANIFEST);
// 	} else {
// 		MANIFEST.behaviorHints.configurationRequired = false;
//     respond(res, MANIFEST);
//   }
  
// });

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
  //console.log(req.params.type, req.params.id)

  let userConf = req.params.userConf
  let videoId =  req.params.id.split(":")[0]
  let type = req.params.type
  let season = req.params.id.split(":")[1]
  let episode = req.params.id.split(":")[2]

  let  clientIp = requestIp.getClientIp(req); 

  if (clientIp.includes("::ffff:")) {
    clientIp = await getPublicIP();
  }
    
  const stream = await dataHandler(userConf, videoId, type, season, episode, clientIp)

  respond(res, { streams: stream, cacheMaxAge: nrOfDays(stream.length > 0 ? 7 : 1), staleRevalidate: nrOfDays(2), staleError: nrOfDays(7) });
});

if (module.parent) {
  module.exports = addon;
} else {
  addon.listen(process.env.PORT || 3634, function () {
    console.log(`Add-on Repository URL: http://127.0.0.1:3634/manifest.json`);
  });
}