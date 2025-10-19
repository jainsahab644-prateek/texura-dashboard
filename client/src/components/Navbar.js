import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TeXura Dashboard
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 2 }}>
              Welcome, {user.fullName} ({user.role})
            </Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </Box>
        ) : (
          <Button color="inherit">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;