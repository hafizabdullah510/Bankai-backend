import React from "react";

const FormRow = ({ type, name, value, handleChange, labelText }) => {
  return (
    <div className="form-row">
      <label htmlFor="name" className="form-label">
        {labelText || name}
      </label>
      <input
        className="form-input"
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={(e) => handleChange(e)}
      />
    </div>
  );
};

export default FormRow;
