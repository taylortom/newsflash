import $ from 'jquery';
import config from './config';
import helpers from '../helpers';

const FEED_PREFIX = 'https://api.rss2json.com/v1/api.json?rss_url=';
let fetched = 0;

class FeedData {
  constructor() {
    this.feeds = [];
  }

  load() {
    return this.fetchHeadlines();
  }

  fetchHeadlines() {
    return new Promise((resolve, reject) => {
      Promise.all(config.get('feeds').map(feed => this.fetchFeed(feed)))
        .then(data => {
          this.feeds = data;
          this.lastUpdated = new Date().toTimeString().slice(0,5);
          resolve();
        })
        .catch(reject);
    });
  }

  fetchFeed(url, done) {
    return new Promise(function(resolve, reject) {
      $.get(FEED_PREFIX + encodeURIComponent(url), function success(data) {
        if(data.status === 'error') {
          console.warn(data.message, url);
          resolve();
        }
        helpers.transformData(data);
        // modify data to return data.feed with the items attached directly
        resolve(Object.assign({}, data.feed, { items: data.items.filter(helpers.filterOldHeadlines) }));
      });
    });
  }
}

export default FeedData;
