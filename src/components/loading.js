import React from 'react';

import Spinner from '../assets/loading.svg';

function Loading(props) {
  return (
    <div className={`loading ${props.percent >= 100 ? 'display-none' : ''}`}>
      <img src={Spinner} alt="loading spinner" />
      <div>Loading {props.percent}%</div>
    </div>
  );
}

export default Loading;
