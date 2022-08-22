import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import Login from '../pages/Login';
import AttributeList from '../pages/AttributeList';
import AttributeShow from '../pages/AttributeShow';
import NoPage from '../pages/NoPage';
import { ToastContainer } from 'react-toastify';
import AuthContext from '../Context/AuthProvider';

const App = () => {
  const { auth } = useContext(AuthContext);

  useEffect(() => {}, [auth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={auth ? <AttributeList /> : <Login />} />
          <Route
            path="/attributes"
            element={auth ? <AttributeList /> : <Login />}
          />
          <Route path="/attributes/:id" element={<AttributeShow />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
};

export default App;
