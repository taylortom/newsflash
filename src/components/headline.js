import React from 'react';

function Headline(props) {
  return (
    <div className="headline">
      <div className="title">
        <a href={props.data.link} target="_blank">{props.data.title}</a>
      </div>
      <div className="blurb">{props.data.description}</div>
      <div className="info">
        <span className="feed">{props.data.feed}</span>
        <span className="time">{props.data.pubTime}</span>
      </div>
    </div>
  );
}

export default Headline;
