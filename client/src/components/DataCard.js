import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const DataCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
    {icon}
    <Box sx={{ ml: 2 }}>
      <Typography variant="h5" component="div">{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

export default DataCard;