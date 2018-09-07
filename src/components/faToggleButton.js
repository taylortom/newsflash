import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

library.add(faCog);

class FaToggleButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: props.isHidden
    };
  }

  render() {
    return (
      <button className="icon-btn open" onClick={this.onClick.bind(this)}>
        {this.state.isHidden ? 'Show' : 'Hide'}
        <FontAwesomeIcon icon="faCog" />
      </button>
    );
  }

  onClick() {
    this.setState({ isHidden: !this.state.isHidden });
  }
}

export default FaToggleButton;
