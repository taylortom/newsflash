import https from 'https';
import http from 'http';

/**
 * Simple RSS/Atom feed parser that converts XML to JSON
 * No external dependencies required
 */

/**
 * Fetch RSS feed from URL
 * @param {string} url - The feed URL
 * @returns {Promise<string>} - The feed XML content
 */
async function fetchFeed(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Newsflash/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    };

    const req = client.get(url, options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects <= 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        const redirectUrl = new URL(res.headers.location, url).href;
        fetchFeed(redirectUrl, maxRedirects - 1).then(resolve, reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch feed: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);

    // Set timeout
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract text content from XML tag
 * @param {string} xml - The XML string
 * @param {string} tag - The tag name
 * @returns {string|null} - The text content or null
 */
function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return null;
  
  // Handle CDATA
  let content = match[1];
  const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch) {
    content = cdataMatch[1];
  }
  
  // Decode HTML entities
  return decodeEntities(content.trim());
}

/**
 * Extract attribute from XML tag
 * @param {string} xml - The XML string
 * @param {string} tag - The tag name
 * @param {string} attr - The attribute name
 * @returns {string|null} - The attribute value or null
 */
function extractAttribute(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Decode HTML entities
 * @param {string} text - The text with entities
 * @returns {string} - The decoded text
 */
function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Parse date string to timestamp
 * @param {string} dateStr - The date string
 * @returns {number} - The timestamp
 */
function parseDate(dateStr) {
  if (!dateStr) return Date.now();
  const timestamp = Date.parse(dateStr);
  return isNaN(timestamp) ? Date.now() : timestamp;
}

/**
 * Parse RSS item
 * @param {string} itemXml - The item XML
 * @returns {Object} - The parsed item
 */
function parseRSSItem(itemXml) {
  const title = extractTag(itemXml, 'title');
  const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary');
  const link = extractTag(itemXml, 'link');
  const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published');
  const creator = extractTag(itemXml, 'dc:creator') || extractTag(itemXml, 'author');
  const guid = extractTag(itemXml, 'guid');
  const content = extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content');
  
  return {
    id: guid || link,
    title: title || '',
    description: description || '',
    link: link || '',
    author: creator || '',
    published: parseDate(pubDate),
    created: Date.now(),
    category: [],
    content: content || '',
    enclosures: [],
    media: {}
  };
}

/**
 * Parse Atom entry
 * @param {string} entryXml - The entry XML
 * @returns {Object} - The parsed entry
 */
function parseAtomEntry(entryXml) {
  const title = extractTag(entryXml, 'title');
  const summary = extractTag(entryXml, 'summary');
  const content = extractTag(entryXml, 'content');
  const linkHref = extractAttribute(entryXml, 'link', 'href');
  const id = extractTag(entryXml, 'id');
  const published = extractTag(entryXml, 'published');
  const updated = extractTag(entryXml, 'updated');
  
  // Extract author name
  const authorMatch = entryXml.match(/<author>([\s\S]*?)<\/author>/i);
  let author = '';
  if (authorMatch) {
    author = extractTag(authorMatch[1], 'name') || '';
  }
  
  return {
    id: id || linkHref,
    title: title || '',
    description: summary || content || '',
    link: linkHref || '',
    author: author,
    published: parseDate(published),
    created: parseDate(updated || published),
    category: [],
    content: content || '',
    enclosures: [],
    media: {}
  };
}

/**
 * Parse RSS/Atom feed to JSON
 * @param {string} url - The feed URL
 * @returns {Promise<Object>} - The parsed feed data
 */
export async function parse(url) {
  const xml = await fetchFeed(url);
  
  // Determine feed type
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');
  
  if (isAtom) {
    // Parse Atom feed
    const feedMatch = xml.match(/<feed[^>]*>([\s\S]*)<\/feed>/i);
    if (!feedMatch) throw new Error('Invalid Atom feed');
    
    const feedContent = feedMatch[1];
    const title = extractTag(feedContent, 'title');
    const subtitle = extractTag(feedContent, 'subtitle');
    const linkHref = extractAttribute(feedContent, 'link', 'href');
    
    // Extract entries
    const entryMatches = feedContent.match(/<entry>([\s\S]*?)<\/entry>/gi) || [];
    const items = entryMatches.map(parseAtomEntry);
    
    return {
      title: title || '',
      description: subtitle || '',
      link: linkHref || '',
      image: '',
      category: [],
      items: items
    };
  } else {
    // Parse RSS feed
    const channelMatch = xml.match(/<channel>([\s\S]*)<\/channel>/i);
    if (!channelMatch) throw new Error('Invalid RSS feed');
    
    const channelContent = channelMatch[1];
    const title = extractTag(channelContent, 'title');
    const description = extractTag(channelContent, 'description');
    const link = extractTag(channelContent, 'link');
    const imageTag = extractTag(channelContent, 'image');
    const imageUrl = imageTag ? extractTag(imageTag, 'url') : null;
    
    // Extract items
    const itemMatches = channelContent.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    const items = itemMatches.map(parseRSSItem);
    
    return {
      title: title || '',
      description: description || '',
      link: link || '',
      image: imageUrl || '',
      category: [],
      items: items
    };
  }
}

export default { parse };
