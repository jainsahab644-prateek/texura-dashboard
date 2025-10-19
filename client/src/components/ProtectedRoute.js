import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If token exists, render the child component (the protected page)
  return children;
};

export default ProtectedRoute;