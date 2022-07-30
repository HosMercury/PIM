import React from 'react';
import logo from '../assets/images/nex.png';

const Login = () => {
  return (
    <div className="bg-nex relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-5/6 m-auto p-6 bg-white border-t-4 border- nex rounded-xl shadow-md border-top md:w-3/5 lg:w-1/3">
        <div className="flex items-center justify-center relative bottom-16 mb-0 p-0">
          <img
            className="object-contain rounded-xl mb-0 border-solid border-2 border-white"
            src={logo}
            alt="logo"
          />
        </div>

        <form className="mt-0" action="/api/login" method="post">
          <div>
            <label htmlFor="username" className="block text-sm text-gray-800">
              Username
            </label>
            <input
              type="text"
              name="username"
              value=""
              onChange={() => {}}
              className="block w-full px-4 py-2 mt-2 text-nex bg-white border rounded-md focus:border-nex focus:ring-nex focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          <div className="mt-4">
            <div>
              <label htmlFor="password" className="block text-sm text-gray-800">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="block w-full px-4 py-2 mt-2 text-nex bg-white border rounded-md focus:border-nex focus:ring-nex focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <div className="mt-4">
              <input
                type="checkbox"
                name="remember"
                value="true"
                onChange={() => {}}
                className="w-4 h-4 p-1 md:w-5 md:h-5 rounded border-nex focus:nex focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-800 relative md:-top-1 px-2"
              >
                Remember me
              </label>
            </div>
            <div className="mt-6">
              <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-nex rounded-md hover:opacity-90 focus:outline-none focus:opacity-90">
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
