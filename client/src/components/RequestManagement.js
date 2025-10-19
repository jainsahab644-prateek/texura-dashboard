import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, List, ListItem, ListItemText, Chip, Box, Button } from '@mui/material';

const RequestManagement = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/requests');
                setRequests(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequests();
    }, []);

    const handleUpdateRequest = async (requestId, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, { status: newStatus });
            setRequests(requests.map(req => (req._id === requestId ? res.data : req)));
            alert(`Request has been ${newStatus}.`);
        } catch (err) {
            alert('Failed to update request.');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'warning';
            case 'Approved':
                return 'success';
            case 'Rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Support Requests</Typography>
            <List>
                {requests.map((req) => (
                    <ListItem key={req._id} divider sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ListItemText
                            primary={`${req.requestType} from ${req.requester.fullName}`}
                            secondary={req.details}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip label={req.status} color={getStatusColor(req.status)} sx={{ mr: 2 }} />
                            {req.status === 'Pending' && (
                                <>
                                    <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }} onClick={() => handleUpdateRequest(req._id, 'Approved')}>
                                        Approve
                                    </Button>
                                    <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateRequest(req._id, 'Rejected')}>
                                        Reject
                                    </Button>
                                </>
                            )}
                        </Box>
                    </ListItem>
                ))}
                {requests.length === 0 && <Typography>No requests found.</Typography>}
            </List>
        </Paper>
    );
};

export default RequestManagement;