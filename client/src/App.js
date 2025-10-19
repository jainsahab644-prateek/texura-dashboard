import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // <-- Import the new Layout
import UserManagementPage from './pages/UserManagementPage';
import TaskManagementPage from './pages/TaskManagementPage';
import RequestManagementPage from './pages/RequestManagementPage';
import ProfilePage from './pages/ProfilePage';
import PayrollPage from './pages/PayrollPage';
import EmployeeProfileViewPage from './pages/EmployeeProfileViewPage';
import './App.css';

function App() {
console.log('THE API URL IS:', process.env.REACT_APP_API_URL);

  return (
    <div className="App">
     <Routes>
  <Route path="/login" element={<LoginPage />} />
  
  <Route 
    path="/" 
    element={<ProtectedRoute><Layout /></ProtectedRoute>} // The Layout component now wraps all nested routes
  >
    {/* This is the default page when you log in */}
    <Route index element={<Navigate to="/dashboard" />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="admin/tasks" element={<TaskManagementPage />} />
    <Route path="admin/users" element={<UserManagementPage />} />
    <Route path="admin/payroll" element={<PayrollPage />} />
    <Route path="admin/user/:userId" element={<EmployeeProfileViewPage />} />
    <Route path="admin/requests" element={<RequestManagementPage />} />

<Route path="profile" element={<ProfilePage />} />
  </Route>

  {/* A fallback for any other path */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
    </div>
  );
}

export default App;