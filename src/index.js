import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import config from './config';
import FALibrary from './faLibrary';

FALibrary.load(config.get('icons'));

ReactDOM.render(<App />, document.getElementById('root'));
