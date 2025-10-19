import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalyticsChart = ({ tasks }) => {
  // Process the tasks data to count statuses
  const statusCounts = {
    'To Do': 0,
    'In Progress': 0,
    'Completed': 0,
  };

  tasks.forEach(task => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }
  });

  const data = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        label: '# of Tasks',
        data: [statusCounts['To Do'], statusCounts['In Progress'], statusCounts['Completed']],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)', // Red
          'rgba(54, 162, 235, 0.5)', // Blue
          'rgba(75, 192, 192, 0.5)',  // Green
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Task Status Overview</Typography>
      <Box sx={{ maxWidth: '400px', margin: 'auto' }}>
        <Doughnut data={data} />
      </Box>
    </Paper>
  );
};

export default AnalyticsChart;