import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SettingsFeeds extends React.Component {
  render() {
    return (
      <div className="block feeds">
        <div className="title">Feeds</div>
        {this.renderFeeds(this.props.feeds)}
      </div>
    );
  }

  renderFeeds() {
    return this.props.feeds.map(feed => {
      return (
        <div className="feed-item">
          <span className="icon"><FontAwesomeIcon icon="feedIcon" /></span>
          <a href="#" data-id={feed.id} onClick={this.onFeedClick.bind(this)}>
            <span className="title">{feed.title}</span>
            <span className="count">({feed.items.length})</span>
          </a>
        </div>
      );
    });
  }

  onFeedClick(event) {
    // event.preventDefault();
    // var id = $(event.currentTarget).attr('data-id');
    // $('#app > .inner').scrollTo($(`.feeds .feed[data-id='${id}']`), 400);
  }
}

export default SettingsFeeds;
