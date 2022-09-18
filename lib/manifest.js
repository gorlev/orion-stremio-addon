module.exports = {
	id: "org.community.orion",
	version: "1.5.0",
	name: "Orion",
	logo: "https://orionoid.com/web/images/logo/logo256.png",
	background: "https://orionoid.com/web/images/background/banner.jpg",
	description: "Orion Stremio Addon, allows Orion-indexed torrent, usenet and hoster links to be played on Stremio. Cached links can be played with RealDebrid, AllDebrid, Debrid-Link, Premiumize or Offcloud. Torrents can be streamed without using any Debrid service. Orion API key is required to use this addon. Get it from panel.orionoid.com",
	types: ["movie", "series"],
	resources: [
	  "stream",
	  "catalog"
	],
	catalogs: [	
		{
			id: "orion.movies",
			name: "Orion",
			type: "movie",
			extra: [
				{
					name: "genre",
					options: [
						"New Releases",
						"Disc Releases",
						"Top Rated",
						"Must Watch",
						"Award Winner",
						"Most Popular",
						"Now Trending",
						"Box Office"
					],
					optionsLimit: 16,
					isRequired: true
				}
			]
		},
		{
			id: "orion.movies-search",
            name: "Orion - Movie - Search",
            type: "movie",
            extra:[
                {
                    name:"search", 
					optionsLimit: 24,
                    isRequired: true
                }
            ]
            
        },
		{
			id: "orion.series",
			name: "Orion",
			type: "series",
			extra: [
				{
					name: "genre",
					options: [
						"New Seasons",
						"New Episodes",
						"Top Rated",
						"Must Watch",
						"Award Winner",
						"Most Popular",
						"Now Trending",
					],
					optionsLimit: 16,
					isRequired: true
				}
			]
		},
		{
			id: "orion.series-search",
            name: "Orion - Series - Search",
            type: "series",
            extra:[
                {
                    name:"search", 
					optionsLimit: 24,
                    isRequired: true
                }
            ]
            
        }
	],
	idPrefixes: ["tt", "kitsu"],
	behaviorHints: {configurable : true, configurationRequired: true }
  };