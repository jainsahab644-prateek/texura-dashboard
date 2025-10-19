import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const PendingUsers = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/pending`);
        setPending(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/approve`);
      setPending(pending.filter(user => user._id !== userId)); // Remove user from list
      alert('User approved!');
    } catch (err) {
      alert('Failed to approve user.');
      console.error(err);
    }
  };

  if (pending.length === 0) return null; // Don't show anything if there are no pending users

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Pending Approvals</Typography>
      <List>
        {pending.map((user) => (
          <ListItem key={user._id} divider sx={{ justifyContent: 'space-between' }}>
            <ListItemText primary={user.fullName} secondary={user.email} />
            <Button variant="contained" size="small" onClick={() => handleApprove(user._id)}>
              Approve
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PendingUsers;