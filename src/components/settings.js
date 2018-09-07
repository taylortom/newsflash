import FaToggleButton from './faToggleButton';
import React from 'react';
import SettingsFeeds from './settings-feeds'

function Settings(props) {
  return (
    <div className="settings">
      <FaToggleButton isHidden={false}/>
      <div className="panel">
        <FaToggleButton isHidden={true}/>
        <div className="inner">
          <SettingsFeeds feeds={props.feeds}/>
        </div>
      </div>
    </div>
  );
}

export default Settings;
