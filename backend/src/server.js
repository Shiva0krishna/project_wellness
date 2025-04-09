const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
