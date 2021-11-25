import fs from 'fs/promises';
import http from 'http';
import rssToJson from 'rss-to-json';

class Server {
  constructor() {
    this.init().catch(console.log);
  }
  async init() {
    this.config = JSON.parse(await fs.readFile('./config.json'));
    this._http = http.createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch(e) {
        res.writeHead(e.statusCode || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: e.message }), 'utf-8');
      }
    });
    this._http.listen(this.config.port);
    console.log(`Server started listening on ${this.config.port}`);
  }
  async handleRequest(req, res) {
    if(req.method === 'GET' && req.url.startsWith('/api/news')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(await this.getRSS()), 'utf-8');
      return;
    }
    await this.serveStatic(req, res);
  }
  async getRSS() {
    return (await Promise.all(this.config.feeds.map(async f => {
      const d = await rssToJson.parse(f);
      return d.items.map(i => Object.assign(i, { feed: d.title }))
    })))
      .reduce((m,i) => [...m, ...i], [])
      .sort((a, b) => {
        if(a.created < b.created) return 1;
        if(a.created > b.created) return -1;
        return 0;
      })
      .slice(0, 100);
  }
  async serveStatic(req, res) {
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fileExt = filePath.slice(filePath.lastIndexOf('.')+1);
    res.writeHead(200, { 'Content-Type': this.extToMime(fileExt) });
    res.end(await fs.readFile(`./public${filePath}`), 'utf-8');
  }
  extToMime(ext) {
    switch(ext) {
      case 'html':
      case 'css':
        return `text/${ext}`;
        case 'js':
        return `text/javascript`;
      case 'ico':
      case 'png':
        return `image/${ext}`;
    }
  }
}

new Server();
