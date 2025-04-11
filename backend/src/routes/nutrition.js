const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const authenticateUser = require("../middleware/auth");
const supabase = require("../utils/db");

// Analyze nutrition from text description
router.post('/analyze-text',authenticateUser, async (req, res) => {
  try {
    const { foodText } = req.body;
    
    if (!foodText) {
      return res.status(400).json({ error: 'No food text provided' });
    }

    // Gemini API endpoint for text analysis - using Gemini 1.5 Flash model
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // Define prompt for text analysis
    const prompt = `Analyze the nutritional content of the following food items and provide a JSON response:
    
    Food items: "${foodText}"
    
    Please provide the following information in JSON format:
    {
      "food_items": [array of identified food items],
      "calories": number,
      "macronutrients": {
        "protein": grams,
        "carbs": grams,
        "fat": grams,
        "fiber": grams
      },
      "health_impact": string summary,
      "recommendations": [array of health tips]
    }`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    // Call Gemini API
    const geminiResponse = await axios.post(geminiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extract response text
    const text = geminiResponse.data.candidates[0].content.parts[0].text;
    console.log(text);
    // Try to parse JSON from the response text
    let nutritionData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Gemini response');
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return res.status(500).json({ error: 'Invalid format in Gemini response' });
    }

    // Transform the data to match the frontend's expected format
    const transformedData = {
      calories: nutritionData.calories || 0,
      protein: nutritionData.macronutrients?.protein || 0,
      carbohydrates: nutritionData.macronutrients?.carbs || 0,
      fats: nutritionData.macronutrients?.fat || 0,
      fiber: nutritionData.macronutrients?.fiber || 0,
      foodItems: nutritionData.food_items || [],
      healthImpact: nutritionData.health_impact || '',
      recommendations: nutritionData.recommendations || []
    };

    // Send the response
    res.json({
      success: true,
      analysis: transformedData,
    });

  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Failed to analyze food text with Gemini API' });
  }
});

// Alias for backward compatibility
router.post('/analyze',authenticateUser, async (req, res) => {
  // Forward to the text analysis endpoint
  req.body.foodText = req.body.foodText || "No food items provided";
  return router._router.handle(req, res);
});

// Log a meal with nutrition data
router.post('/log', authenticateUser, async (req, res) => {
  try {
    const { 
      date, 
      meal, 
      food_items, 
      total_calories, 
      protein_grams, 
      carbs_grams, 
      fat_grams, 
      fiber_grams 
    } = req.body;

    // Validate required fields
    if (!date || !meal || !food_items || !total_calories) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate meal type
    const validMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!validMeals.includes(meal)) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }

    // Insert into nutrition_logs table
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert([
        {
          user_id: req.user.id,
          date,
          meal,
          food_items,
          total_calories,
          protein_grams,
          carbs_grams,
          fat_grams,
          fiber_grams
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error logging nutrition:', error);
    res.status(500).json({ error: 'Failed to log nutrition data' });
  }
});

// Get user's nutrition logs
router.get('/logs', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition logs' });
  }
});

// Delete a nutrition log
router.delete('/logs/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the log belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ error: 'Nutrition log not found' });
    }

    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    res.status(500).json({ error: 'Failed to delete nutrition log' });
  }
});

module.exports = router;
