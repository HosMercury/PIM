import React from 'react';
import Breadcrumb from './Breadcrumb';

const Header = ({ title, first, second }) => {
  return (
    <>
      <Breadcrumb first={first} second={second} />
      <div className="flex justify-between align-middle mb-4 border-b p-2">
        <h1 className="sm:text-3xl text-3xl text-nex font-bold">{title}</h1>
      </div>
    </>
  );
};

export default Header;
