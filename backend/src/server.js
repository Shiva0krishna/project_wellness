const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://project-wellness-beta.vercel.app',
      'https://project-wellness.vercel.app',
      'http://localhost:3000'
    ].filter(Boolean); // Remove any undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running! 💡');
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
