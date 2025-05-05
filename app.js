const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Apply CORS middleware before routes
app.use(cors({
  origin: ['http://localhost:5173','https://admin.ohcapp.online'], // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Allow credentials (cookies, authorization headers)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Static file serving

// Test endpoint
app.get('/test', (req, res) => {
  res.send("Welcome OHC");
});

// Routes
app.use('/api', authRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err));

// Start the server
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
