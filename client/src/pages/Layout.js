import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/images/nex.png';
import Link from 'react-router-dom';

function Layout() {
  return (
    <div className="flex min-h-screen">
      <div className="min-h-screen md:w-[6rem] w-24 bg-nex flex flex-col text-white text-center pb-6 shrink-0">
        <a href="/">
          <img className="object-contain mt-4" src={logo} alt="logo" />
          <h5 className="mt-2 mb-4 text-xl relative right-1">Content</h5>
        </a>
        <div className="bg-nex flex flex-col text-white text-center shrink-0">
          <button
            className="attributes-trigger mt-6 hover:bg-white hover:text-nex cursor-pointer box-border"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            Attributes
          </button>

          <button
            className="mt-6 hover:bg-white hover:text-nex cursor-pointer box-border"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              ></path>
            </svg>
            Products
          </button>

          <button
            className="mt-6 hover:bg-white hover:text-nex cursor-pointer box-border"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            Users
          </button>

          <button
            className="mt-6 hover:bg-white hover:text-nex cursor-pointer box-border"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Settings
          </button>
        </div>
      </div>

      <div className="attributes-menu hidden shadow-2xl absolute z-20 flex flex-col text-left bg-white p-2 px-3 border border-nex rounded">
        <ul className="text-gray-700 text-xl">
          <li className="my-4">
            <a
              href="/attributes"
              className="block w-100 hover:bg-nex hover:text-white p-2 px-4 rounded cursor-pointer"
            >
              Attributes
            </a>
          </li>
          <li className="my-4">
            <a
              href="/groups"
              className="block w-100 hover:bg-nex hover:text-white p-2 px-4 rounded cursor-pointer"
            >
              Groups
            </a>
          </li>
        </ul>
      </div>
      <div className="w-full">
        <div className="h-[4rem] text-nex flex flex-row-reverse items-center space-x-3 bg-white border-b-2 border-gray-200">
          <form
            action="/logout"
            method="post"
            className="hover:bg-gray-200 mx-4 cursor-pointer p-1"
          >
            <button type="submit" className="mx-auto px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 m-auto mt-4"
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
              <span className="text-sm">Logout</span>
            </button>
          </form>
          <p className="mx-2"></p>
        </div>
        <div className="p-8 w-100 text-xl relative">
          <div className="flex justify-between mb-8 border-b-2 p-3 shadow	 ">
            <h2 className="text-3xl text-nex">Attributes</h2>
            <button className="bg-nex text-white rounded-md py-2 px-3 justify-self-end hover:opacity-90 ">
              Crreate Attribute
            </button>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
