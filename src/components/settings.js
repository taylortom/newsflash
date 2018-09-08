import FaToggleButton from './faToggleButton';
import React from 'react';
import SettingsFeeds from './settings-feeds'

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: props.isHidden
    };
  }

  render() {
    return (
      <div className={`settings ${this.state.isHidden ? 'hidden' : ''}`}>
        <FaToggleButton icon='cog' onClick={this.toggleVisibility.bind(this)}/>
        <div className="panel">
          <div className="inner">
            <SettingsFeeds feeds={this.props.feeds}/>
          </div>
        </div>
      </div>
    );
  }

  toggleVisibility() {
    this.setState({ isHidden: !this.state.isHidden });
  }
}


export default Settings;
