import React, { useState, useContext } from 'react';
import logo from '../assets/images/nex.png';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../Context/AuthProvider';

const alphaDashNumeric = /^[a-zA-Z0-9-_]+$/;

const Login = () => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [remember, setRemember] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const { setAuth } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameError(null);
    setPasswordError(null);

    let canSubmit = true;

    if (username === '') {
      setUsernameError('Username is required');
      canSubmit = false;
    }
    if (username.length >= 5 && username.search(alphaDashNumeric) === -1) {
      setUsernameError(
        'Username field must contains only letters, numbers, dash and underscore'
      );
      canSubmit = false;
    }
    if (username.length > 0 && username.length < 5) {
      setUsernameError('Username must be at least 5 letters');
      canSubmit = false;
    }
    if (username.length > 50) {
      setUsernameError('Username maximum 50 letters');
      canSubmit = false;
    }
    if (password === '') {
      setPasswordError('Password is required');
      canSubmit = false;
    }
    if (password.length > 0 && password.length < 5) {
      setPasswordError('Password must be at least 5 letters');
      canSubmit = false;
    }
    if (password.length > 100) {
      setPasswordError('Password maximum 100 letters');
      canSubmit = false;
    }

    console.log(usernameError);

    if (canSubmit) {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password, remember })
        });

        if (res.status === 200) {
          const data = await res.json();
          setAuth(data);
          navigate('/attributes');
        } else if (res.status === 422) {
          setErrMsg('Invalid credentials');
        }
      } catch (e) {
        console.log(e);
        setErrMsg('Server Error');
      }
    }
  };

  return (
    <div className="bg-nex relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-5/6 m-auto p-6 bg-white border-t-4 border- nex rounded-xl shadow-md border-top sm:w-3/5 lg:w-1/3">
        <div className="flex items-center justify-center relative bottom-16 mb-0 p-0">
          <img
            className="object-contain rounded-xl mb-0 border-solid border-2 border-white animate-bounce	"
            src={logo}
            alt="logo"
          />
        </div>
        {errMsg && <p className="form-err">{errMsg}</p>}
        <form className="mt-0" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm text-gray-800">
              Username
            </label>
            <input
              required
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="border-nex block w-full px-4 py-2 mt-2 text-nex bg-white border rounded-md focus:border-nex focus:ring-nex focus:outline-none focus:ring focus:ring-opacity-40"
            />
            {usernameError && <p className="form-err">{usernameError}</p>}
          </div>
          <div className="mt-4">
            <div>
              <label htmlFor="password" className="block text-sm text-gray-800">
                Password
              </label>
              <input
                required
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
                className="border-nex block w-full px-4 py-2 mt-2 text-nex bg-white border rounded-md focus:border-nex focus:ring-nex focus:outline-none focus:ring focus:ring-opacity-40"
              />
              {passwordError && <p className="form-err">{passwordError}</p>}
            </div>
            <div className="mt-4">
              <input
                type="checkbox"
                name="remember"
                value="true"
                onChange={(e) => setRemember(!remember)}
                className="w-4 h-4 p-1 sm:w-5 sm:h-5 rounded border-nex focus:nex focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-800 relative sm:-top-1 px-2"
              >
                Remember me
              </label>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform
                 bg-nex rounded-md hover:opacity-90 focus:outline-none focus:opacity-90"
              >
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
