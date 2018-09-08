import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function FaButton(props) {
  return (
    <button className='icon-btn' onClick={props.onClick}>
      <FontAwesomeIcon icon={props.icon} />
    </button>
  );
}

export default FaButton;
