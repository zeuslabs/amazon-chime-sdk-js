import React from 'react';

import './Submit.css';

const Submit = props => {
  const { children, ...rest } = props;

  return (
    <button className="Submit" {...rest}>
      {children}
    </button>
  );
};

export default Submit;
