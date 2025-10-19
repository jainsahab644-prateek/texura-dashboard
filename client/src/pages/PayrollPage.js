import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Grid, Button, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [date, setDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/payroll/${date.year}/${date.month}`);
        setPayrollData(res.data);
      } catch (err) {
        console.error("Failed to fetch payroll", err);
        setPayrollData([]);
      }
    };
    fetchPayroll();
  }, [date]);

  const handleDateChange = (e) => {
    setDate({ ...date, [e.target.name]: e.target.value });
  };

  const handleMarkAsPaid = async (payslipId) => {
    try {
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/payroll/${payslipId}/pay`);
        setPayrollData(payrollData.map(p => p._id === payslipId ? res.data : p));
        alert('Salary marked as paid!');
    } catch (err) {
        alert('Failed to update status.');
        console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const filteredPayroll = payrollData
    .filter(payslip => 
      payslip.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(payslip =>
      statusFilter ? payslip.status === statusFilter : true
    );

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>Payroll Management</Typography>
      
      {/* --- Combined Filter Panel --- */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Year" type="number" name="year" value={date.year} onChange={handleDateChange} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Month" type="number" name="month" value={date.month} onChange={handleDateChange} InputProps={{ inputProps: { min: 1, max: 12 } }}/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Search by Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Net Pay</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayroll.map((payslip) => (
              <TableRow key={payslip._id}>
                <TableCell>{payslip.user?.fullName || 'User Not Found'}</TableCell>
                <TableCell>{formatCurrency(payslip.baseSalary)}</TableCell>
                <TableCell>{formatCurrency(payslip.netPay)}</TableCell>
                <TableCell><Chip label={payslip.status} color={payslip.status === 'Paid' ? 'success' : 'warning'} /></TableCell>
                <TableCell>
                  {payslip.status === 'Pending' && <Button variant="contained" size="small" onClick={() => handleMarkAsPaid(payslip._id)}>Mark as Paid</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PayrollPage;