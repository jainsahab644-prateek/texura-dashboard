import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import UserManagement from '../components/UserManagement';
import PendingUsers from '../components/PendingUsers';

const UserManagementPage = () => {
  return (
    <Box
      sx={{
        padding: '30px',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      {/* Page Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: '600',
          mb: 3,
          textAlign: 'center',
          color: '#333',
        }}
      >
        User Management
      </Typography>

      {/* Pending Users */}
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '12px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            mb: 2,
            color: '#444',
          }}
        >
          Pending Requests
        </Typography>
        <PendingUsers />
      </Paper>

      {/* Active Users */}
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          borderRadius: '12px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            mb: 2,
            color: '#444',
          }}
        >
          Active Users
        </Typography>
        <UserManagement />
      </Paper>
    </Box>
  );
};

export default UserManagementPage;
