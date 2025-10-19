import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Container, Paper, Typography, TextField, Button, Grid, Box, Avatar } from '@mui/material';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me`);
                    setProfile(res.data);
                } catch (err) {
                    console.error(err);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile/me/picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile(res.data);
            alert('Profile picture updated!');
        } catch (err) {
            alert('Failed to upload picture.');
            console.error(err);
        }
    };

    const onChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };
    
    const onNestedChange = (e, parent) => {
        setProfile({
            ...profile,
            [parent]: {
                ...profile[parent],
                [e.target.name]: e.target.value,
            },
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile`, profile);
            setProfile(res.data);
            alert('Profile Updated Successfully!');
        } catch (err) {
            alert('Failed to update profile.');
            console.error(err);
        }
    };

    if (loading || !profile) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>My Profile</Typography>
            <Paper component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar src={profile.profilePicture || ''} sx={{ width: 120, height: 120, mb: 2, border: '2px solid lightgray' }} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                    <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
                        Upload Picture
                    </Button>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6">Personal & Job Information</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" value={profile.user?.fullName || ''} disabled /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Email Address" value={profile.user?.email || ''} disabled /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Phone Number" name="phoneNumber" value={profile.phoneNumber || ''} onChange={onChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Job Title / Position" name="jobTitle" value={profile.jobTitle || ''} onChange={onChange} disabled /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Date of Joining" name="dateOfJoining" type="date" value={profile.dateOfJoining ? profile.dateOfJoining.split('T')[0] : ''} onChange={onChange} InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6">Address</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Street" name="street" value={profile.address?.street || ''} onChange={(e) => onNestedChange(e, 'address')} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="City" name="city" value={profile.address?.city || ''} onChange={(e) => onNestedChange(e, 'address')} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="State" name="state" value={profile.address?.state || ''} onChange={(e) => onNestedChange(e, 'address')} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Zip Code" name="zipCode" value={profile.address?.zipCode || ''} onChange={(e) => onNestedChange(e, 'address')} /></Grid>
                    </Grid>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6">Education</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Highest Degree" name="degree" value={profile.highestGraduation?.degree || ''} onChange={(e) => onNestedChange(e, 'highestGraduation')} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="University" name="university" value={profile.highestGraduation?.university || ''} onChange={(e) => onNestedChange(e, 'highestGraduation')} /></Grid>
                    </Grid>
                </Box>

                <Button type="submit" variant="contained">Save Profile Changes</Button>
            </Paper>
        </Container>
    );
};

export default ProfilePage;