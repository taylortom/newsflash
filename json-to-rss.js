/**
 * Converts JSON news data to RSS 2.0 XML format
 * No external dependencies required
 */

/**
 * Escape XML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeXml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to RFC 822 format (required for RSS)
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - RFC 822 formatted date
 */
function formatRFC822Date(timestamp) {
  const date = new Date(timestamp);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = days[date.getUTCDay()];
  const dateNum = date.getUTCDate().toString().padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  return `${day}, ${dateNum} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}

/**
 * Convert JSON news items to RSS 2.0 XML
 * @param {Array} items - Array of news items
 * @param {Object} options - RSS feed options
 * @returns {string} - RSS 2.0 XML string
 */
export function toRSS(items, options = {}) {
  const {
    title = 'Newsflash',
    description = 'Aggregated news feed',
    link = 'http://localhost:3000',
    language = 'en'
  } = options;
  
  const channelTitle = escapeXml(title);
  const channelDescription = escapeXml(description);
  const channelLink = escapeXml(link);
  const channelLanguage = escapeXml(language);
  
  let rssItems = '';
  
  if (Array.isArray(items)) {
    rssItems = items.map(item => {
      const itemTitle = escapeXml(item.title || '');
      const itemDescription = escapeXml(item.description || item.content || '');
      const itemLink = escapeXml(item.link || '');
      const itemAuthor = item.author ? escapeXml(item.author) : '';
      // Use current time as fallback to ensure valid RSS (RSS 2.0 requires pubDate)
      // Items from backend should always have published/created timestamps
      const itemPubDate = formatRFC822Date(item.published || item.created || Date.now());
      // isPermaLink indicates whether guid is a permalink (URL)
      // It's true when guid value matches the link (regardless of whether it came from item.id or item.link)
      const guidValue = item.id || item.link || '';
      const itemGuid = escapeXml(guidValue);
      const isPermaLink = guidValue === item.link;
      
      let itemXml = `    <item>
      <title>${itemTitle}</title>
      <description>${itemDescription}</description>
      <link>${itemLink}</link>
      <pubDate>${itemPubDate}</pubDate>
      <guid isPermaLink="${isPermaLink ? 'true' : 'false'}">${itemGuid}</guid>`;
      
      if (itemAuthor) {
        itemXml += `\n      <author>${itemAuthor}</author>`;
      }
      
      if (item.feed) {
        itemXml += `\n      <category>${escapeXml(item.feed)}</category>`;
      }
      
      itemXml += '\n    </item>';
      return itemXml;
    }).join('\n');
  }
  
  // Construct atom:link self reference URL, handling trailing slashes
  const baseUrl = link.endsWith('/') ? link.slice(0, -1) : link;
  const selfLink = escapeXml(`${baseUrl}/api/rss`);
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <description>${channelDescription}</description>
    <link>${channelLink}</link>
    <language>${channelLanguage}</language>
    <lastBuildDate>${formatRFC822Date(Date.now())}</lastBuildDate>
    <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;
  
  return rss;
}

export default { toRSS };
