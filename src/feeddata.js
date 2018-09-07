import axios from 'axios';
import config from './config';
import helpers from './helpers';

class FeedData {
  constructor() {
    this.feeds = [];
    this.latestHeadlines = [];
    this.lastUpdated = '';
  }

  load() {
    return this.fetchFeeds();
  }

  fetchFeedsSync() {
    return new Promise((resolve, reject) => {
      let feeds = config.get('feeds');
      const _fetchFeedsRecursive = function() {
        if(feeds.length === 0) {
          return resolve();
        }
        setTimeout(() => {
          this.fetchFeed(feeds.pop()).then(_fetchFeedsRecursive).catch(reject);
        }, 2000);
      }.bind(this);
      _fetchFeedsRecursive();
    });
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
    return new Promise(function(resolve, reject) {
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
      })
      .catch((error) => {
        console.warn(error.message, url);
        resolve();
      });
    });
  }
}

export default FeedData;
