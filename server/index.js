// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Connect to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    // If connection fails, log the error and exit the process
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

connectDB(); // Call the function to connect to the DB

// 4. Setup Middleware


app.use(cors());

app.use(express.json());

// 5. Define Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the TeXura Dashboard API!' });
});

// A simple route to test the DB connection status
app.get('/db-test', (req, res) => {
    const connectionState = mongoose.connection.readyState;
    // 0 = disconnected; 1 = connected; 2 = connecting; 3 = disconnecting
    let status = 'Unknown';
    if (connectionState === 0) status = 'Disconnected';
    if (connectionState === 1) status = 'Connected';
    if (connectionState === 2) status = 'Connecting';
    if (connectionState === 3) status = 'Disconnecting';
    
    res.json({ success: true, db_status: status });
});

// ... existing code for middleware and routes ...

// Define API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes')); // Add this line
app.use('/api/requests', require('./routes/requestRoutes.js'));
app.use('/api/notifications', require('./routes/notificationRoutes.js')); // Add this line
app.use('/api/salary', require('./routes/salaryRoutes.js')); // Add this line
app.use('/api/profile', require('./routes/profileRoutes.js'));
app.use('/api/payroll', require('./routes/payrollRoutes.js'));


// 6. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});