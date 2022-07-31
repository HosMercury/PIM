import React from 'react';

const MainMenuItem = ({ d, header, children }) => {
  return (
    <button
      className="attributes-trigger mt-6 border-l-4 border-nex hover:bg-white hover:text-nex py-2 cursor-pointer box-border"
      href="/"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 mx-auto my-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d}></path>
        {children}
      </svg>
      {header}
    </button>
  );
};

export default MainMenuItem;
