import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState, createContext } from 'react';
import Layout from './Layout';
import Login from '../pages/Login';
import AttributeList from '../pages/AttributeList';
import AttributeShow from '../pages/AttributeShow';
import NoPage from '../pages/NoPage';
import { ToastContainer } from 'react-toastify';

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  const getUser = async () => {
    const res = await fetch('/api/me');
    const data = await res.json();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<AttributeList />} />
            <Route
              path="attributes"
              element={user ? <AttributeList /> : <Login />}
            />
            <Route
              path="attributes/:id"
              element={user ? <AttributeShow /> : <Login />}
            />
            <Route path="*" element={user ? <NoPage /> : <Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </UserContext.Provider>
  );
};

export default App;
