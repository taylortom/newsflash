import fs from 'fs/promises';
import http from 'http';
import rssToJson from 'rss-to-json';

class Server {
  constructor() {
    this.init().catch(console.log);
  }
  async init() {
    await this.updateConfig();
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
  parseQuery(req) {
    const queryString = req.url.split('?')[1] ?? '';
    const query = {};

    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      query[key] = value;
    });
    if(!query.feeds || !this.config.feeds[query.feeds]) {
      query.feeds = 'default';
    }
    return query;
  }
  async handleRequest(req, res) {
    const query = this.parseQuery(req);
    if(req.method === 'GET' && req.url.startsWith('/api/config')) {
      return this.sendResponse(res, { data: this.config });
    }
    if(req.method === 'GET' && req.url.startsWith('/api/news')) {
      return this.sendResponse(res, { data: await this.getRSS(query) });
    }
    await this.serveStatic(req, res);
  }
  async updateConfig() {
    this.config = JSON.parse(await fs.readFile('./config.json'))
  }
  async getRSS(query) {
    await this.updateConfig();
    const results = [];
    await Promise.allSettled(this.config.feeds[query.feeds].map(f => {
      return new Promise(async (resolve, reject) => {
        const t = setTimeout(() => {
          console.log(`RSS load timeout for ${f}`);
          reject();
        }, this.config.timeout);
        try {
          const d = await rssToJson.parse(f.feed);
          clearTimeout(t);
          if(d.items) results.push(...d.items.map(i => Object.assign(i, { feed: f.name ?? this.generateTitle(d), type: f.type })));
        } catch(e) {
          console.log(f, e.errno);
        }
        resolve();
      });
    }));
    return results
      .sort((a, b) => {
        if(a.created < b.created) return 1;
        if(a.created > b.created) return -1;
        return 0;
      })
      .slice(0, 100);
  }
  generateTitle(data) {
    return data.title.split(/[^A-Za-z0-9\s]/)[0].trim();
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
