import React from 'react';

const Input = props => {
  const { name, value, title, type, placeholder, handleChange } = props;

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {title}
      </label>
      <input
        className="form-control"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;
