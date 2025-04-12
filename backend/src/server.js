const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Strip trailing slash from FRONTEND_URL if present
const allowedOrigin = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '';

// CORS configuration using cors package
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request from origin:', origin);
    // Allow the actual origin regardless of what's in env file
    // This dynamically handles the origin without trailing slash issues
    callback(null, origin);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running! 💡');
});

// Routes
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const trackingRoutes = require('./routes/tracking');
app.use('/api/tracking', trackingRoutes);

const geminiRoutes = require('./routes/gemini');
app.use('/api/gemini', geminiRoutes);

const assistantRoutes = require('./routes/assistant');
app.use('/api/assistant', assistantRoutes);

const nutritionRoutes = require('./routes/nutrition');
app.use('/api/nutrition', nutritionRoutes);

const medicalRoutes = require('./routes/medical');
app.use('/api/medical', medicalRoutes);

const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Frontend URL configured as: ${process.env.FRONTEND_URL}`);
});
