import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/images/nex.png';
import Link from 'react-router-dom';
import MainMenuItem from './MainMenuItem';
import SecondaryMenuItem from './SecondaryMenuItem';

function Layout() {
  const [showMainMenu, setShowMainMenu] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      <div
        className={`min-h-screen md:w-28 w-24 bg-nex flex flex-col text-white text-center pb-4 shrink-0
      md:text-base text-sm font-bold transition-all ease-in-out duration-200 delay-75  md:translate-x-0 md:block md:static  ${
        showMainMenu ? ' translate-x-0 ' : ' -translate-x-28 absolute'
      }`}
      >
        <a href="/" className="hover:animate-pulse">
          <img className="object-contain mt-4" src={logo} alt="logo" />
          <h5 className="mt-2 mb-6 md:text-xl text-base relative right-1">
            Content
          </h5>
        </a>
        <div className="bg-nex flex flex-col text-white text-center shrink-0">
          <MainMenuItem
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            header="Attributes"
          />

          <MainMenuItem
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            header="Products"
          />

          <MainMenuItem
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            header="Users"
          />

          <MainMenuItem
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            header="Settings"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </MainMenuItem>
        </div>

        <div
          className="hidden absolute z-10 h-40 md:top-[150px] top-[139px] left-24 md:left-28 flex flex-col text-left flex-1
         bg-white py-1 px-4 border-1 rounded-r-lg border-nex text-nex font-bold border-r border-b"
        >
          <ul className="text-gray-700 text-xl">
            <SecondaryMenuItem header="Attributes" />
            <SecondaryMenuItem header="Groups" />
          </ul>
        </div>
      </div>

      <div className="grow md:mx-8 mx-4">
        <div className="h-[50px] text-nex bg-white md:border-0 border-b-2 border-gray-200">
          <button
            className="w-16 block md:hidden p-1"
            onClick={() => setShowMainMenu(!showMainMenu)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          {/* Logout */}
          <form
            action="/logout"
            method="post"
            className="mx-2 md:mx-4 py-2 px-2 absolute z-10 top-0 right-1"
          >
            <button
              type="submit"
              className="mx-auto px-2 cursor-pointer flex items-center"
            >
              <span className="mx-1">Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 m-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </button>
          </form>
        </div>
        <div className="my-4">
          <div className="flex justify-between mb-4">
            <h2 className="md:text-3xl text-2xl text-nex">Attributes</h2>
            <button className="border-nex hover:bg-gray-100 hover:font-bold border text-nex rounded-md py-1 md:px-4 px-2 justify-self-end hover:opacity-90 absolute right-6 md:right-10">
              Create
            </button>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
