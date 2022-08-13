import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="flex justify-between align-middle my-4">
      <h2 className="sm:text-3xl text-2xl text-nex">{title}</h2>
    </div>
  );
};

export default Header;
