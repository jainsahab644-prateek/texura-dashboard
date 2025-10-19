import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Paper, 
  Typography, Grid, Box, Chip, Tabs, Tab
} from '@mui/material';
import AnalyticsChart from './AnalyticsChart';
import DataCard from './DataCard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';

// A dedicated, styled Task Card for the employee view
const EmployeeTaskCard = ({ task, handleStatusChange }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  
  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'High': return { icon: <ArrowUpwardIcon fontSize="small" />, color: 'error' };
      case 'Medium': return { icon: <RemoveIcon fontSize="small" />, color: 'warning' };
      case 'Low': return { icon: <ArrowDownwardIcon fontSize="small" />, color: 'success' };
      default: return { icon: <RemoveIcon fontSize="small" />, color: 'default' };
    }
  };
  const priorityProps = getPriorityProps(task.priority);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: `5px solid`,
        borderColor: `${priorityProps.color}.main`
      }}
    >
      <Box>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {task.description || 'No description'}
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            icon={priorityProps.icon}
            label={task.priority}
            color={priorityProps.color}
            size="small"
            variant="outlined"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={task.status}
              label="Status"
              onChange={(e) => handleStatusChange(task._id, e.target.value)}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {task.dueDate && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              color: isOverdue ? 'error.main' : 'text.secondary',
              fontWeight: isOverdue ? 'bold' : 'normal'
            }}
          >
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const EmployeeDashboard = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [requestData, setRequestData] = useState({ requestType: 'Support', details: '' });
  const [currentTab, setCurrentTab] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/mytasks`);
        setMyTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks', err);
      }
    };
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/status`, {
        status: newStatus,
      });
      setMyTasks(myTasks.map((task) => (task._id === taskId ? res.data : task)));
      console.log('Task status updated!');
    } catch (err) {
      console.error('Failed to update status.');
    }
  };

  const handleRequestChange = (e) => setRequestData({ ...requestData, [e.target.name]: e.target.value });

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/requests`, requestData);
      alert('Request submitted successfully!');
      setRequestData({ requestType: 'Support', details: '' });
    } catch (err) {
      alert('Failed to submit request.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const completedTasks = myTasks.filter((task) => task.status === 'Completed').length;
  const inProgressTasks = myTasks.filter((task) => task.status === 'In Progress').length;
  const totalTasks = myTasks.length;

  const filteredTasks = myTasks
    .filter((task) => (priorityFilter ? task.priority === priorityFilter : true))
    .filter((task) => (statusFilter ? task.status === statusFilter : true));

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="employee dashboard tabs">
          <Tab label="Overview" />
          <Tab label="My Assigned Tasks" />
          <Tab label="Submit a Request" />
        </Tabs>
      </Box>

      {/* OVERVIEW TAB */}
      {currentTab === 0 && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Total Assigned Tasks"
                value={totalTasks}
                icon={<AssignmentIcon color="primary" sx={{ fontSize: 40 }} />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Tasks In Progress"
                value={inProgressTasks}
                icon={<AutorenewIcon color="warning" sx={{ fontSize: 40 }} />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Tasks Completed"
                value={completedTasks}
                icon={<CheckCircleIcon color="success" sx={{ fontSize: 40 }} />}
              />
            </Grid>
          </Grid>
          {myTasks.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <AnalyticsChart tasks={myTasks} />
            </Box>
          )}
        </Box>
      )}

      {/* TASKS TAB */}
      {currentTab === 1 && (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Filter by Priority"
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    <MenuItem value="To Do">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {filteredTasks.length > 0 ? (
            <Grid
              container
              spacing={3}
              sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}
            >
              {filteredTasks.map((task) => (
                <Grid
                  item
                  key={task._id}
                  sx={{
                    flex: '0 0 300px',
                    marginRight: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <EmployeeTaskCard task={task} handleStatusChange={handleStatusChange} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 2 }}>No tasks match your filters.</Typography>
          )}
        </Box>
      )}

      {/* REQUEST TAB */}
      {currentTab === 2 && (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Submit a Request
            </Typography>
            <Box component="form" onSubmit={handleRequestSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Request Type</InputLabel>
                <Select
                  name="requestType"
                  value={requestData.requestType}
                  label="Request Type"
                  onChange={handleRequestChange}
                >
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Clarification">Clarification</MenuItem>
                  <MenuItem value="Access">Access</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="details"
                label="Details"
                value={requestData.details}
                onChange={handleRequestChange}
                multiline
                rows={3}
                fullWidth
                margin="normal"
                required
              />
              <Button type="submit" variant="contained">
                Submit Request
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </div>
  );
};

export default EmployeeDashboard;
