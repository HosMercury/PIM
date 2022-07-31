import React from 'react';

const SecondaryMenuItem = ({ header }) => {
  return (
    <li className="my-4">
      <a
        href="/attributes"
        className="block w-100 hover:bg-nex hover:text-white p-2 px-4 rounded cursor-pointer"
      >
        {header}
      </a>
    </li>
  );
};

export default SecondaryMenuItem;
