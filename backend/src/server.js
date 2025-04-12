const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Use CORS with environment variable
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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
});
