import axios from 'axios';
import config from './config';
import EventEmitter from 'events';
import helpers from './helpers';

class FeedData extends EventEmitter {
  constructor() {
    super();
    this.feeds = [];
    this.latestHeadlines = [];
    this.lastUpdated = '';
  }

  load() {
    return this.fetchFeeds();
  }

  fetchFeeds() {
    return new Promise((resolve, reject) => {
      Promise.all(config.get('feeds').map(feed => this.fetchFeed(feed)))
        .then(data => {
          this.feeds = data.filter(item => item !== undefined);
          this.latestHeadlines = helpers.getLatestHeadlines(this.feeds);
          this.lastUpdated = new Date().toTimeString().slice(0,5);
          resolve();
        })
        .catch(reject);
    });
  }

  fetchFeed(url) {
    return new Promise((resolve, reject) => {
      axios.get(config.get('apiUrl'), {
        params: {
          rss_url: url,
          api_key: config.get('apiKey')
        }
      })
      .then(response => {
        const data = response.data;
        if(data.status === 'error') {
          return resolve();
        }
        helpers.transformData(data);
        // modify data to return data.feed with the items attached directly
        resolve(Object.assign({}, data.feed, { items: data.items.filter(helpers.filterOldHeadlines) }));
        this.emit('fetched', url);
      })
      .catch((error) => {
        console.warn(error.message, url);
        resolve();
      });
    });
  }
}

export default FeedData;
