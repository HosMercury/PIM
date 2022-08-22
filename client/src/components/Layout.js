import React, { useState, useContext, useEffect } from 'react';
import logo from '../assets/images/nex.png';
import { Link } from 'react-router-dom';
import MainMenuItem from './MainMenuItem';
import SecondaryMenuItem from './SecondaryMenuItem';
import { HiMenuAlt2 } from 'react-icons/hi';
import { RiUser3Line } from 'react-icons/ri';
import { AiOutlineLogout } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { Loading } from './Loading';
import AuthContext from '../Context/AuthProvider';

function Layout({ children }) {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showAttributesMenu, setShowAttributesMenu] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showUsersMenu, setShowUsersMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const { auth } = useContext(AuthContext);

  console.log(auth);

  const switchMenus = (header) => {
    switch (header) {
      case 'Attributes':
        setShowAttributesMenu(!showAttributesMenu);
        break;
      case 'Products':
        setShowProductsMenu(!showProductsMenu);
        break;
      case 'Users':
        setShowUsersMenu(!showUsersMenu);
        break;
      case 'Settings':
        setShowSettingsMenu(!showSettingsMenu);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate('/login');
    }
  }, [auth]);

  const onClick = (header) => {
    switchMenus(header);
  };

  const onMouseOver = (header) => {
    switchMenus(header);
  };

  const onMouseOut = (header) => {
    switchMenus(header);
  };

  const handleLogout = async (e) => {
    await fetch('/api/logout', {
      method: 'POST'
    });
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen relative ">
      <div
        className={`sm:w-28 w-24 bg-nex flex flex-col text-white text-center pb-4 shrink-0
            sm:text-base text-sm font-bold transition-all ease-in-out duration-200 delay-75  sm:translate-x-0 sm:block sm:static  ${
              showMainMenu ? ' translate-x-0 ' : ' -translate-x-28 absolute'
            }`}
      >
        <Link to="/" className="hover:animate-pulse">
          <img className="object-contain mt-4" src={logo} alt="logo" />
          <h5 className="mt-2 mb-6 sm:text-xl text-base relative right-1">
            Content
          </h5>
        </Link>
        <div className="bg-nex flex flex-col text-white text-center shrink-0">
          <MainMenuItem
            header="Attributes"
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
          <MainMenuItem
            header="Products"
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
          <MainMenuItem
            header="Users"
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
          <MainMenuItem
            header="Settings"
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        </div>

        <div
          className={`secondary-menu absolute z-10 h-40 sm:top-[145px] top-[131px] ${
            showAttributesMenu ? ' block ' : ' hidden '
          }
        `}
        >
          <ul
            className="text-gray-700 text-xl"
            onMouseOver={() => setShowAttributesMenu(true)}
            onMouseOut={() => setShowAttributesMenu(false)}
          >
            <SecondaryMenuItem header="Attributes" />
            <SecondaryMenuItem header="Groups" />
          </ul>
        </div>

        <div
          className={`secondary-menu  absolute z-[12] h-40 sm:top-[256px] top-[238px]  ${
            showProductsMenu ? ' block ' : ' hidden '
          }`}
        >
          <ul
            className="text-gray-700 text-xl"
            onMouseOver={() => setShowProductsMenu(true)}
            onMouseOut={() => setShowProductsMenu(false)}
          >
            <SecondaryMenuItem header="Products" />
            <SecondaryMenuItem header="Slugs" />
          </ul>
        </div>

        <div
          className={`secondary-menu  absolute z-[12] h-40 sm:top-[256px] top-[238px]  ${
            showProductsMenu ? ' block ' : ' hidden '
          }`}
        >
          <ul
            className="text-gray-700 text-xl"
            onMouseOver={() => setShowProductsMenu(true)}
            onMouseOut={() => setShowProductsMenu(false)}
          >
            <SecondaryMenuItem header="Products" />
            <SecondaryMenuItem header="Slugs" />
          </ul>
        </div>

        <div
          className={`secondary-menu  absolute z-[12] h-40 sm:top-[370px] top-[350px]  ${
            showUsersMenu ? ' block ' : ' hidden '
          }`}
        >
          <ul
            className="text-gray-700 text-xl"
            onMouseOver={() => setShowUsersMenu(true)}
            onMouseOut={() => setShowUsersMenu(false)}
          >
            <SecondaryMenuItem header="Users" />
            <SecondaryMenuItem header="Roles" />
          </ul>
        </div>

        <div
          className={`secondary-menu  absolute z-[12] h-40 sm:top-[480px] top-[458px]  ${
            showSettingsMenu ? ' block ' : ' hidden '
          }`}
        >
          <ul
            className="text-gray-700 text-xl"
            onMouseOver={() => setShowSettingsMenu(true)}
            onMouseOut={() => setShowSettingsMenu(false)}
          >
            <SecondaryMenuItem header="Settings" />
            <SecondaryMenuItem header="Options" />
          </ul>
        </div>
      </div>
      <div className="grow sm:mx-8 mx-2 w-full">
        <div className=" h-[50px] bg-white sm:border-0 border-b-2 border-gray-200 ">
          <button
            className="w-16 block sm:hidden "
            onClick={() => setShowMainMenu(!showMainMenu)}
          >
            <HiMenuAlt2 className="h-8 w-8 my-2" />
          </button>

          {/* Username and Logout */}
          <div className="mx-4 flex justify-center align-middle  text-gray-700 	absolute top-4 right-0 text-sm sm:text-base ">
            {auth && (
              <div className="flex justify-center align-middle mx-1 ">
                <RiUser3Line className="w-4 h-4 mx-1 relative sm:top-1" />
                <span>{auth.firstname}</span>
              </div>
            )}

            <button
              className="  inline-block "
              onClick={(e) => handleLogout(e)}
            >
              <AiOutlineLogout className="w-6 h-6 " />
            </button>
          </div>
        </div>
        {children}
        <div className="mt-20 text-center border-t py-2 block  text-gray-500">
          Copyright© NEX {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default Layout;
