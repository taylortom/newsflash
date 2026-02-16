import fs from 'fs/promises';
import http from 'http';
import rssParser from './rss-parser.js';
import jsonToRss from './json-to-rss.js';

// RFC-compliant hostname pattern:
// - Must start and end with alphanumeric character
// - Can contain alphanumeric, hyphens, and dots in between
// - No consecutive dots, no leading/trailing dots or hyphens
const HOSTNAME_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*$/;

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
    if(req.method === 'GET' && req.url.startsWith('/api/rss')) {
      const newsData = await this.getRSS(query);
      // Determine base URL for RSS feed links
      // RECOMMENDED: Set config.baseUrl in production for security and consistency
      // Fallback uses Host header (sanitized) and protocol detection
      // Note: Host header and X-Forwarded-Proto are client-controllable;
      // config.baseUrl should be used in production environments
      let baseUrl = this.config.baseUrl;
      if (!baseUrl) {
        const protocol = this.getProtocol(req);
        baseUrl = `${protocol}://${this.sanitizeHost(req.headers.host)}`;
      }
      const rssXml = jsonToRss.toRSS(newsData, {
        title: this.config.name || 'Newsflash',
        description: 'Aggregated news feed',
        link: baseUrl
      });
      return this.sendResponse(res, { contentType: 'application/rss+xml', data: rssXml });
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
          console.log(`RSS load timeout for ${f.feed}`);
          reject();
        }, this.config.timeout);
        try {
          const d = await rssParser.parse(f.feed);
          clearTimeout(t);
          if(d.items) results.push(...d.items.map(i => Object.assign(i, { feed: f.name ?? this.generateTitle(d), type: f.type ?? 'news' })));
        } catch(e) {
          console.log(`Failed to parse ${f.feed}`, e.errno);
          console.log(e);
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
  getProtocol(req) {
    // Detect protocol from request (for proper RSS feed URLs)
    // Note: X-Forwarded-Proto is trusted by default, which is standard for proxy deployments
    // For production use, set config.baseUrl instead of relying on headers
    // Check X-Forwarded-Proto header (set by proxies/load balancers)
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (forwardedProto === 'https') {
      return 'https';
    }
    // Check if connection is encrypted (direct HTTPS)
    if (req.socket && req.socket.encrypted) {
      return 'https';
    }
    // Default to http
    return 'http';
  }
  sanitizeHost(host) {
    // Validate and sanitize Host header to prevent injection attacks
    if (!host || typeof host !== 'string') {
      return `localhost:${this.config.port}`;
    }
    
    // Reject hosts with multiple colons (invalid format)
    const colonCount = (host.match(/:/g) || []).length;
    if (colonCount > 1) {
      return `localhost:${this.config.port}`;
    }
    
    // Split hostname and port
    const [hostname, portStr] = host.split(':');
    
    // Validate hostname using RFC-compliant pattern
    if (!HOSTNAME_PATTERN.test(hostname)) {
      return `localhost:${this.config.port}`;
    }
    
    // Validate port if specified
    if (portStr !== undefined) {
      const port = parseInt(portStr, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return `localhost:${this.config.port}`;
      }
    }
    
    return host;
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
