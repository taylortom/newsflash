# newsflash
Simple RSS reader using Node.js and a Web Components front-end. Avoids CORS issues by loading the feeds via the Node.js app.

Requires a config.json at the root which defines the feeds:
- `name`: name of the app
- `port`: port to use for HTTP requests
- `feeds`: array of RSS feeds to use for news sources
