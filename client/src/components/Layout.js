import React, { useContext } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Notifications from './Notifications';
import { 
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Button 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const adminMenu = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Tasks', path: '/admin/tasks', icon: <AssignmentIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Requests', path: '/admin/requests', icon: <RequestQuoteIcon /> },
    { text: 'Payroll', path: '/admin/payroll', icon: <PaymentsIcon /> },
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> }
  ];

  const employeeMenu = [
    { text: 'My Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'My Profile', path: '/profile', icon: <PersonIcon /> }
  ];

  const menuItems = user?.role === 'admin' ? adminMenu : employeeMenu;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 121, 107, 0.8)', // Theme color with transparency
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar>

            {/* --- ADD THIS IMG TAG --- */}
  <img src="/texura-logo.png" alt="TeXura Logo" style={{ height: '40px', marginRight: '16px' }} />
  {/* ------------------------- */}

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TeXura Employee Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Notifications />
            <Typography sx={{ ml: 2, mr: 2 }}>Welcome, {user?.fullName}</Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // Frosted glass effect
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <Toolbar /> {/* Spacer */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    transition: 'background-color 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Toolbar /> {/* Spacer */}
        <Outlet /> {/* Renders the current page's component */}
      </Box>
    </Box>
  );
};

export default Layout;