# orion-stremio-addon
Orion Stremio Addon, allows Orion-indexed torrent, usenet and hoster links to be played on Stremio. Cached links can be played with RealDebrid, Premiumize or Offcloud. Torrents can be stream without using any Debrid service. Multiple Debrid services also can be used at the same time. Orion API key is required to use this addon. Get it from [https://panel.orionoid.com](https://panel.orionoid.com)

### Attention
Please be careful while setting the "Link Limit per Search" section. Link limit is the maximum number of streams to return. If not specified, all available links are returned. Make sure to specify a limit (default is 5), since without one you might use up the entire daily limit with one query.

## Installation

### Remote
Click on [https://5a0d1888fa64-orion.baby-beamup.club](https://5a0d1888fa64-orion.baby-beamup.club) and make your adjustments. Then, click install.

### Local
Unfortunately, local usage is not possible because you will need the app API key.

## Todo
Features I would like to implement and stuff needed to be done:
- [x] Documentation
- [x] Configuration page
- [x] More configuration options that Orion already supports
- [x] Debrid support with Orion's natively supported Debrid services (Real-Debrid, Premiumize.me, Offcloud)

## Contributions
Great thanks to:
* Orion Team for their great support.
* [tmdb-addon](https://github.com/mrcanelas/tmdb-addon), [torrentio-addon](https://github.com/TheBeastLT/torrentio-scraper) and [deflix-stremio](https://github.com/doingodswork/deflix-stremio) for the idea of preparing the configuration page. 
