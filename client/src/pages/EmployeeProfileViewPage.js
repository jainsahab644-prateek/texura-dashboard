import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Grid, Box, Avatar, CircularProgress } from '@mui/material';

const EmployeeProfileViewPage = () => {
    const { userId } = useParams(); // Get user ID from the URL
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/user/${userId}`);
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!profile) {
        return <Typography>Profile not found.</Typography>;
    }

    return (
        <Container>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar src={profile.profilePicture || ''} sx={{ width: 150, height: 150, mb: 2 }} />
                        <Typography variant="h4">{profile.user?.fullName}</Typography>
                        <Typography variant="h6" color="text.secondary">{profile.jobTitle || 'No position set'}</Typography>
                    </Grid>

                    <Grid item xs={12}><hr /></Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Contact Information</Typography>
                        <Typography><strong>Email:</strong> {profile.user?.email}</Typography>
                        <Typography><strong>Phone:</strong> {profile.phoneNumber || 'N/A'}</Typography>
                        <Typography mt={1}><strong>Address:</strong></Typography>
                        <Typography>{profile.address?.street || 'N/A'}</Typography>
                        <Typography>{profile.address?.city}, {profile.address?.state} {profile.address?.zipCode}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Job Details</Typography>
                        <Typography><strong>Date of Joining:</strong> {profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'N/A'}</Typography>
                        <Typography mt={1}><strong>Highest Graduation:</strong></Typography>
                        <Typography>{profile.highestGraduation?.degree || 'N/A'}</Typography>
                        <Typography><em>{profile.highestGraduation?.university || 'N/A'}</em></Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default EmployeeProfileViewPage;