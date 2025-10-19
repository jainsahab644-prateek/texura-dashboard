import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);
  
  useEffect(() => {
    setAuthToken(token);
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/users/me');
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token, logout]);
const login = useCallback(async (formData) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, formData);
      setToken(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      // Improved error handling to show specific messages
      if (err.response && err.response.data && err.response.data.msg) {
        alert(err.response.data.msg); // e.g., "Your account is pending admin approval."
      } else {
        alert('Login failed. Please check your credentials.');
      }
      console.error(err);
    }
}, [navigate]);
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};