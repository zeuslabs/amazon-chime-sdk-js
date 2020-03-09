import React from 'react';

import './Input.css';

const Input = props => {
  const { name, label, ...rest } = props;

  return (
    <div className="input-group">
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input className="input" name={name} {...rest} />
    </div>
  );
};

export default Input;
