import React from 'react';
import Headline from './headline';

function Feed(props) {
  return (
    <div className="feed">
      <div className="title">{props.title}</div>
      <div className="headlines">{renderHeadlines(props.items)}</div>
    </div>
  );
}

function renderHeadlines(headlines) {
  return headlines.map(headline => {
    return <Headline key={headline.guid} data={headline}/>
  });
}

export default Feed;
