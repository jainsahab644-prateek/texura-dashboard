import React from 'react';
import { Container, Typography } from '@mui/material';
import RequestManagement from '../components/RequestManagement';

const RequestManagementPage = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Support Requests
      </Typography>
      <RequestManagement />
    </Container>
  );
};

export default RequestManagementPage;