import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnalyticsChart from './AnalyticsChart';
import { Grid, Paper, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const DataCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
    {icon}
    <Box sx={{ ml: 2 }}>
      <Typography variant="h6">{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ tasks: 0, users: 0, requests: 0 });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tasksRes, usersRes, requestsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks'),
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/requests')
        ]);
        setTasks(tasksRes.data);
        setStats({
          tasks: tasksRes.data.length,
          users: usersRes.data.length,
          requests: requestsRes.data.length
        });
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
    fetchAllData();
  }, []);

  return (
    <div>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <DataCard title="Total Tasks" value={stats.tasks} icon={<AssignmentIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataCard title="Total Users" value={stats.users} icon={<PeopleIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataCard title="Support Requests" value={stats.requests} icon={<RequestQuoteIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
      </Grid>
      
      <AnalyticsChart tasks={tasks} />
    </div>
  );
};

export default AdminDashboard;