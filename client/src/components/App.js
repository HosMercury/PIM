import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Layout from './Layout';
import Login from '../pages/Login';
import AttributeList from '../pages/AttributeList';
import NoPage from '../pages/NoPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<AttributeList />} />
          <Route path="attributes" element={<AttributeList />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
