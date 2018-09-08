import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

function FaButton(props) {
  return (
    <button className='icon-btn' onClick={props.onClick}>
      <FontAwesomeIcon icon={faCog} />
    </button>
  );
}

export default FaButton;
