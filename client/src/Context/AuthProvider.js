import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const getAuth = async () => {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (res.status === 200) {
      setAuth(data);
    }
  };

  useEffect(() => {
    getAuth();
  }, []);

  // console.log('Provider', auth);
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
