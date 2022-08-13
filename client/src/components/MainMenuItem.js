import React from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import { CgListTree } from 'react-icons/cg';
import { FiUsers, FiShoppingBag } from 'react-icons/fi';

const MainMenuItem = ({ header, onClick, onMouseOver, onMouseOut }) => {
  const renderSwitch = (type) => {
    switch (type) {
      case 'Settings':
        return <IoSettingsOutline className="main-menu-icon" />;
      case 'Users':
        return <FiUsers className="main-menu-icon" />;
      case 'Products':
        return <FiShoppingBag className="main-menu-icon" />;
      case 'Attributes':
        return <CgListTree className="main-menu-icon" />;
      default:
        break;
    }
  };

  const onMouseOverChild = (header) => {
    onMouseOver(header);
  };
  const onMouseOutChild = (header) => {
    onMouseOut(header);
  };

  return (
    <button
      className="mt-4 border-l-4 border-nex hover:bg-gray-100 hover:text-nex py-2 text-center"
      onClick={() => onClick(header)}
      onMouseOver={onMouseOverChild}
      onMouseOut={onMouseOutChild}
    >
      {renderSwitch(header)}
      {header}
    </button>
  );
};

export default MainMenuItem;
