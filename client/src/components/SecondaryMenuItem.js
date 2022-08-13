import React from 'react';
import { Link } from 'react-router-dom';

const SecondaryMenuItem = ({ header }) => {
  return (
    <li className="my-4">
      <Link
        to={header}
        className="block w-100 hover:bg-nex hover:text-white p-2 px-4 rounded cursor-pointer"
      >
        {header}
      </Link>
    </li>
  );
};

export default SecondaryMenuItem;
