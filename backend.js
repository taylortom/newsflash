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
        return this.sendResponse(res, { statusCode: e.statusCode || 500, data: { message: e.message } });
      }
    });
    this._http.listen(this.config.port);
    console.log(`Server started listening on ${this.config.port}`);
  }
  async handleRequest(req, res) {
    if(req.method === 'GET' && req.url.startsWith('/api/config')) {
      return this.sendResponse(res, { data: this.config });
    }
    if(req.method === 'GET' && req.url.startsWith('/api/news')) {
      return this.sendResponse(res, { data: await this.getRSS() });
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
    const [url] = req.url.split('?');
    const filePath = url === '/' ? '/index.html' : url;
    const fileExt = filePath.slice(filePath.lastIndexOf('.')+1);
    this.sendResponse(res, { contentType: this.extToMime(fileExt), data: await fs.readFile(`./public${filePath}`) });
  }
  sendResponse(res, { statusCode=200, contentType='application/json', data }) {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(contentType === 'application/json' ? JSON.stringify(data) : data, 'utf-8');
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
