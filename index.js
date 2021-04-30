const express = require("express");
const addon = express();
const path = require('path');
require('dotenv').config();
const dataHandler = require('./lib/dataHandler');
const requestIp = require('request-ip');

var respond = function (res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
};

var MANIFEST = {
  id: "org.community.orion",
  version: "1.1.0",
  name: "Orion",
  logo: "https://orionoid.com/web/images/logo/logo256.png",
  description: "Orion Stremio Addon. Orion API key is required to use this addon. Get it from panel.orionoid.com",
  types: ["movie", "series", "others"],
  resources: [
    "stream"
  ],
  catalogs: [],
  idPrefixes: ["tt"],
  behaviorHints: {configurable : true, configurationRequired: true }
};

addon.use(requestIp.mw())

addon.get("/", async function (req, res) {
  res.redirect("/configure")
});

addon.get("/manifest.json", async function (req, res) {
  respond(res, MANIFEST);
});

addon.get("/:userConf?/configure", async function (req, res) {
  res.sendFile(path.join(__dirname+'/configure.html'));
});

addon.get('/:userConf/manifest.json', async function (req, res) {

  if (typeof req.params.userConf === "undefined") {
		MANIFEST.behaviorHints.configurationRequired = true;
		respond(res, MANIFEST);
	} else {
		MANIFEST.behaviorHints.configurationRequired = false;
    respond(res, MANIFEST);
  }
});

const nrOfDays = (nr) => nr * (24 * 3600);

addon.get('/:userConf/stream/:type/:id.json', async function (req, res, next) {
  console.log(req.params.type, req.params.id)

  let userConf = req.params.userConf
  let videoId =  req.params.id.split(":")[0]
  let type = req.params.type
  let season = req.params.id.split(":")[1]
  let episode = req.params.id.split(":")[2]

  const clientIp = requestIp.getClientIp(req); 

  const ip = req.clientIp;
  console.log("ip:",ip)
  console.log("clientip:",clientIp)

  
  const stream = await dataHandler(userConf, videoId, type, season, episode)

  respond(res, { streams: stream,  cacheMaxAge: nrOfDays(stream.length > 0 ? 7 : 1), staleRevalidate: nrOfDays(2), staleError: nrOfDays(7) });
});


 
addon.use(function(req, res) {
    const ip = req.clientIp;
    console.log(ip)
    res.end(ip);
});

addon.get('/:userConf/:resource/:type/:id/:extra?.json', (req, res, next) => {
  const { configuration, resource, type, id } = req.params;
  const extra = req.params.extra ? qs.parse(req.url.split('/').pop().slice(0, -5)) : {}
  const configValues = { ...extra, ...parseConfiguration(configuration), ip: requestIp.getClientIp(req) };
  addonInterface.get(resource, type, id, configValues)
      .then(resp => {
        const cacheHeaders = {
          cacheMaxAge: 'max-age',
          staleRevalidate: 'stale-while-revalidate',
          staleError: 'stale-if-error'
        };
        const cacheControl = Object.keys(cacheHeaders)
            .map(prop => resp[prop] && cacheHeaders[prop] + '=' + resp[prop])
            .filter(val => !!val).join(', ');

        res.setHeader('Cache-Control', `${cacheControl}, public`);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(resp));
      })
      .catch(err => {
        if (err.noHandler) {
          if (next) {
            next()
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ err: 'not found' }));
          }
        } else {
          console.error(err);
          res.writeHead(500);
          res.end(JSON.stringify({ err: 'handler error' }));
        }
      });
});


if (module.parent) {
  module.exports = addon;
} else {
  addon.listen(process.env.PORT || 3634, function () {
    console.log(`Add-on Repository URL: http://127.0.0.1:3634/manifest.json`);
  });
}