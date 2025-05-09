import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const Auth = createContext();
export const useAuth = () => useContext(Auth);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const register = async (email, password) => {
    const { data } = await axios.post('/auth/register', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
    setToken(null);
  };

  return (
    <Auth.Provider value={{ token, login, register, logout }}>
      {children}
    </Auth.Provider>
  );
}
