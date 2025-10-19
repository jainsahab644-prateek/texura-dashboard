import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Select, MenuItem, IconButton, Typography, Modal, Box, TextField, Button, FormControl, InputLabel, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const UserManagement = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [newSalary, setNewSalary] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState({ jobTitle: '', dateOfJoining: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/role`, { role: newRole });
      fetchUsers();
      alert('User role updated!');
    } catch (err) { alert('Failed to update role.'); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully.');
      } catch (err) { alert(err.response?.data?.msg || 'Failed to delete user.'); }
    }
  };
  
  const openSalaryModal = (user) => { setCurrentUser(user); setNewSalary(user.salary?.baseSalary || ''); setSalaryModalOpen(true); };
  const closeSalaryModal = () => setSalaryModalOpen(false);

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/salary/${currentUser._id}`, { baseSalary: newSalary });
      fetchUsers();
      alert('Salary updated successfully!');
      closeSalaryModal();
    } catch (err) { alert('Failed to update salary.'); }
  };
  
  const openProfileModal = (user) => {
    setCurrentUser(user);
    setCurrentUserProfile({
        jobTitle: user.profile?.jobTitle || '',
        dateOfjoining: user.profile?.dateOfJoining ? user.profile.dateOfJoining.split('T')[0] : ''
    });
    setProfileModalOpen(true);
  };
  const closeProfileModal = () => setProfileModalOpen(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/profile/${currentUser._id}`, currentUserProfile);
        fetchUsers();
        alert('Profile updated successfully!');
        closeProfileModal();
    } catch (err) { alert('Failed to update profile.'); }
  };

  const filteredUsers = users
    .filter(user => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(user => roleFilter ? user.role === roleFilter : true);

  return (
    <>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Filter Users</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField fullWidth label="Search by Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select value={roleFilter} label="Filter by Role" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value=""><em>All Roles</em></MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Active Users ({filteredUsers.length})</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Salary (Base)</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell><Link to={`/admin/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{user.fullName}</Link></TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell onClick={() => user.role === 'employee' && openSalaryModal(user)} sx={{ cursor: user.role === 'employee' ? 'pointer' : 'default' }}>
                    {user.role === 'employee' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(user.salary?.baseSalary || 0) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}><Select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} disabled={user._id === loggedInUser?._id}><MenuItem value="admin">Admin</MenuItem><MenuItem value="employee">Employee</MenuItem></Select></FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openProfileModal(user)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteUser(user._id)} disabled={user._id === loggedInUser?._id}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={salaryModalOpen} onClose={closeSalaryModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleUpdateSalary}>
          <Typography variant="h6" component="h2">Update Salary for {currentUser?.fullName}</Typography>
          <TextField type="number" margin="normal" fullWidth label="Base Salary (INR)" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} required />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Salary</Button>
        </Box>
      </Modal>
      
      <Modal open={profileModalOpen} onClose={closeProfileModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleProfileUpdate}>
          <Typography variant="h6" component="h2">Edit Profile for {currentUser?.fullName}</Typography>
          <TextField margin="normal" fullWidth label="Job Title / Position" name="jobTitle" value={currentUserProfile.jobTitle} onChange={(e) => setCurrentUserProfile({...currentUserProfile, jobTitle: e.target.value})} />
          <TextField margin="normal" fullWidth label="Date of Joining" name="dateOfJoining" type="date" value={currentUserProfile.dateOfJoining} onChange={(e) => setCurrentUserProfile({...currentUserProfile, dateOfJoining: e.target.value})} InputLabelProps={{ shrink: true }}/>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
        </Box>
      </Modal>
    </>
  );
};

export default UserManagement;