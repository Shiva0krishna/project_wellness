const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Get health news from GNews API
router.get('/health', async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    
    // More specific query for medical and health news
    const query = '(medical OR healthcare OR medicine OR health) AND (research OR study OR treatment OR diagnosis OR prevention)';
    
    const response = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q: query,
        lang: 'en',
        country: 'us',
        max: 10,
        apikey: apiKey
      }
    });

    // Format the response to include only necessary information
    const formattedArticles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: article.source.name
    }));

    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching health news:', error);
    res.status(500).json({ error: 'Failed to fetch health news' });
  }
});

module.exports = router; 