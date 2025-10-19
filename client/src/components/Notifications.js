import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) { // Only fetch if user is logged in
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`);
          setNotifications(res.data);
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
      }
    };

    fetchNotifications();
    // Optional: Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => {
    setAnchorEl(null);
    // If there are notifications, mark them as read
    if (notifications.length > 0) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/read`);
        setNotifications([]); // Clear notifications from the UI immediately
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton
        size="large"
        aria-label={`show ${notifications.length} new notifications`}
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <ListItem key={notif._id}>
                <ListItemText primary={notif.message} secondary={new Date(notif.createdAt).toLocaleString()} />
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2 }}>No new notifications</Typography>
          )}
        </List>
      </Popover>
    </>
  );
};

export default Notifications;