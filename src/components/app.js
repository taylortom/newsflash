import React from 'react';
import config from '../config';
import Feed from './feed';
import FeedData from '../feeddata';
import Loading from './loading';
import Settings from './settings';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: config.get('appName'),
      feeds: [],
      lastUpdated: null,
      latestHeadlineCount: 0,
      feedLoadCount: 0,
      feedLoadPercent: 0
    };
    this.fd = new FeedData();
    this.fd.on('fetched', this.updateLoadingProgress.bind(this));

    setInterval(() => {
      console.log('Updating');
      this.fetchFeeds();
    }, config.get('updateInterval'));
  }

  componentDidMount() {
    this.fetchFeeds();
  }

  render() {
    return (
      <div id="app">
        <Settings feeds={this.state.feeds} isHidden={true}/>
        <div className="inner">
          <div className="title">
            {this.state.title}
            <div className="lastUpdated">Latest {this.state.title}: {this.state.lastUpdated}</div>
          </div>
          <Loading percent={this.state.feedLoadPercent}/>
          <div className="feeds">
            {this.renderFeeds()}
          </div>
        </div>
      </div>
    );
  }

  renderFeeds() {
    return this.state.feeds.map(feed => {
      return <Feed key={feed.id} title={feed.title} items={feed.items}/>;
    });
  }

  fetchFeeds() {
    this.fd.load().then(() => {
      this.setState({
        feeds: this.fd.feeds,
        lastUpdated: this.fd.lastUpdated,
        latestHeadlineCount: this.fd.latestHeadlineCount
      });
      if(this.state.feeds.length === 0) {
        console.warn('Failed to load any feeds');
      }
    }).catch(console.error);
  }

  updateLoadingProgress() {
    const newFeedLoadCount = this.state.feedLoadCount+1;
    const newFeedLoadPercent = Math.round((newFeedLoadCount/config.get('feeds').length)*100);
    this.setState({
      feedLoadPercent: newFeedLoadPercent,
      feedLoadCount: newFeedLoadCount
    });
  }
}

export default App;
