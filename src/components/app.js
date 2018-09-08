import React from 'react';
import Config from '../config';
import Feed from './feed';
import FeedData from '../feeddata';
import Settings from './settings';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: Config.get('appName'),
      feeds: [],
      lastUpdated: null,
      latestHeadlineCount: 0
    };
    this.fd = new FeedData();
    setInterval(() => {
      console.log('Updating');
      this.fetchFeeds();
    }, Config.get('updateInterval'));
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
          <div className={`feeds ${this.state.feeds.length ? '' : 'display-none'}`}>
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
}

export default App;
