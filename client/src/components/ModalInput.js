import React from 'react';

const ModalInput = ({ label }) => {
  return (
    <div className="my-2">
      <label htmlFor={label} className="modal-label">
        {label.slice(0, 1).toUpperCase() + label.slice(1)} :
      </label>
      <input id={label} type="text" className="modal-input " />
    </div>
  );
};

export default ModalInput;
