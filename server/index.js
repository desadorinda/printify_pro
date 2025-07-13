// Entry point for Express backend
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB (just require to initialize pool)
require('./config/db');

// Serve uploads folder for images
app.use('/uploads', express.static(__dirname + '/../uploads'));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/custom-design-requests', require('./routes/customDesignRequests'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
