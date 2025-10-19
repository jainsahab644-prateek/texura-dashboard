import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import { Typography, Container } from '@mui/material';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  // This page now only decides which role-specific component to show.
  // The layout, welcome message, and logout are handled by the Layout component.
  return (
    <Container>
      {user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
    </Container>
  );
};

export default DashboardPage;