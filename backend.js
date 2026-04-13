import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import rssParser from './rss-parser.js';
import jsonToRss from './json-to-rss.js';

class Server {
  constructor() {
    this._cache = {};
    this.init().catch(console.log);
  }
  async init() {
    await this.updateConfig();
    // Warn if baseUrl is not set
    if (!this.config.baseUrl) {
      console.warn('WARNING: config.baseUrl is not set. RSS feed links will be omitted. Set baseUrl in config.json for production use.');
    }
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
    const url = new URL(req.url, 'http://localhost');
    const feeds = url.searchParams.get('feeds');
    const query = { feeds: 'default' };

    if(feeds && this.config.feeds[feeds]) {
      query.feeds = feeds;
    }
    return query;
  }
  async handleRequest(req, res) {
    const query = this.parseQuery(req);
    if(req.method === 'GET' && req.url.startsWith('/api/config')) {
      return this.sendResponse(res, { data: this.config });
    }
    if(req.method === 'GET' && req.url.startsWith('/api/news')) {
      const data = await this.getRSS(query);
      return this.sendResponseWithETag(req, res, { data });
    }
    if(req.method === 'GET' && req.url.startsWith('/api/rss')) {
      const newsData = await this.getRSS(query);
      const rssXml = jsonToRss.toRSS(newsData.items, {
        title: this.config.name || 'Newsflash',
        description: 'Aggregated news feed',
        link: this.config.baseUrl || ''
      });
      return this.sendResponseWithETag(req, res, { contentType: 'application/rss+xml', data: rssXml });
    }
    await this.serveStatic(req, res);
  }
  async updateConfig() {
    try {
      const configData = await fs.readFile('./config.json', 'utf-8');
      this.config = JSON.parse(configData);
    } catch(e) {
      if (!this.config) {
        // First load failed - exit with clear error message
        console.error('ERROR: Failed to load config.json:', e.message);
        process.exit(1);
      }
      // Keep previous config on subsequent failures
      console.error('ERROR: Failed to reload config.json, keeping previous configuration:', e.message);
    }
  }
  async getRSS(query) {
    await this.updateConfig();
    const cacheKey = query.feeds
    const cached = this._cache[cacheKey]
    const maxAge = (this.config.fetchInterval || 5) * 60 * 1000
    if (cached && (Date.now() - cached.time) < maxAge) {
      return cached.data
    }
    const results = [];
    const errors = [];

    // Cap total aggregation time
    const aggregationTimeout = (this.config.aggregationTimeout || 30) * 1000;
    const fetchPromise = Promise.allSettled(this.config.feeds[query.feeds].map(f => {
      return new Promise(async (resolve, reject) => {
        const t = setTimeout(() => {
          const msg = `RSS load timeout for ${f.feed}`;
          console.log(msg);
          errors.push({ feed: f.name || f.feed, message: 'Request timeout' });
          reject();
        }, this.config.timeout || 10000);
        try {
          const d = await rssParser.parse(f.feed);
          clearTimeout(t);
          if(d.items) results.push(...d.items.map(i => Object.assign(i, { feed: f.name ?? this.generateTitle(d), type: f.type ?? 'news' })));
        } catch(e) {
          console.log(`Failed to parse ${f.feed}`, e.errno);
          console.log(e);
          errors.push({ feed: f.name || f.feed, message: e.message || 'Parse error' });
        }
        resolve();
      });
    }));

    // Race against aggregation timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        errors.push({ feed: 'aggregation', message: `Aggregation timeout after ${this.config.aggregationTimeout || 30}s` });
        resolve();
      }, aggregationTimeout);
    });

    await Promise.race([fetchPromise, timeoutPromise]);

    const items = results
      .sort((a, b) => {
        if(a.created < b.created) return 1;
        if(a.created > b.created) return -1;
        return 0;
      })
      .slice(0, 100);
    const data = { items, errors };
    this._cache[cacheKey] = { time: Date.now(), data }
    return data
  }
  generateTitle(data) {
    return data.title.split(/[^A-Za-z0-9\s]/)[0].trim();
  }
  async serveStatic(req, res) {
    const [url] = req.url.split('?');
    const filePath = url === '/' ? '/index.html' : url;
    const publicDir = path.resolve('./public');
    const resolvedPath = path.resolve(publicDir, filePath.replace(/^\//, ''));
    if (!resolvedPath.startsWith(publicDir + path.sep)) {
      return this.sendResponse(res, { statusCode: 404, data: { message: 'Not found' } });
    }
    const fileExt = resolvedPath.slice(resolvedPath.lastIndexOf('.')+1);
    this.sendResponse(res, { contentType: this.extToMime(fileExt), data: await fs.readFile(resolvedPath) });
  }
  sendResponse(res, { statusCode=200, contentType='application/json', data, headers={} }) {
    const baseHeaders = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...headers
    };
    res.writeHead(statusCode, baseHeaders);
    res.end(contentType === 'application/json' ? JSON.stringify(data) : data, 'utf-8');
  }
  sendResponseWithETag(req, res, { statusCode=200, contentType='application/json', data }) {
    // Generate ETag from response body
    const body = contentType === 'application/json' ? JSON.stringify(data) : data;
    const etag = '"' + crypto.createHash('md5').update(body).digest('hex').substring(0, 16) + '"';

    // Check If-None-Match header
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      res.writeHead(304, {
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });
      res.end();
      return;
    }

    // Send response with ETag
    this.sendResponse(res, {
      statusCode,
      contentType,
      data,
      headers: { 'ETag': etag }
    });
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
