module.exports = {
	id: "org.community.orion",
	version: "1.4.7",
	name: "Orion",
	logo: "https://orionoid.com/web/images/logo/logo256.png",
	background: "https://orionoid.com/web/images/background/banner.jpg",
	description: "Orion Stremio Addon, allows Orion-indexed torrent, usenet and hoster links to be played on Stremio. Cached links can be played with RealDebrid, Premiumize or Offcloud. Torrents can be streamed without using any Debrid service. Orion API key is required to use this addon. Get it from panel.orionoid.com",
	types: ["movie", "series"],
	resources: [
	  "stream", "meta"
	],
	catalogs: [],
	idPrefixes: ["tt", "kitsu"],
	behaviorHints: {configurable : true, configurationRequired: true }
  };