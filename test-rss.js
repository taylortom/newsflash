import rssToJson from 'rss-to-json';

// Test with a sample RSS feed
const testFeed = 'https://feeds.bbci.co.uk/news/rss.xml';

try {
  const data = await rssToJson.parse(testFeed);
  console.log('Full data structure (top level):');
  console.log(JSON.stringify({
    title: data.title,
    description: data.description,
    link: data.link,
    itemsCount: data.items?.length || 0
  }, null, 2));
  console.log('\n\nFirst item:');
  if (data.items && data.items.length > 0) {
    console.log(JSON.stringify(data.items[0], null, 2));
  }
} catch(e) {
  console.log('Error:', e.message);
}
