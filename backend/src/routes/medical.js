const express = require('express');
const router = express.Router();
const  supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

// Get user's medical history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('diagnosis_date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

// Add a new medical condition
router.post('/history', authenticateUser, async (req, res) => {
  try {
    const { condition, diagnosis_date, treatment, medications } = req.body;

    if (!condition || !diagnosis_date) {
      return res.status(400).json({ error: 'Condition and diagnosis date are required' });
    }

    const { data, error } = await supabase
      .from('medical_history')
      .insert([
        {
          user_id: req.user.id,
          condition,
          diagnosis_date,
          treatment,
          medications
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding medical condition:', error);
    res.status(500).json({ error: 'Failed to add medical condition' });
  }
});

// Update a medical condition
router.put('/history/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, diagnosis_date, treatment, medications } = req.body;

    if (!condition || !diagnosis_date) {
      return res.status(400).json({ error: 'Condition and diagnosis date are required' });
    }

    // First check if the medical condition belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('medical_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ error: 'Medical condition not found' });
    }

    const { data, error } = await supabase
      .from('medical_history')
      .update({
        condition,
        diagnosis_date,
        treatment,
        medications
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    console.error('Error updating medical condition:', error);
    res.status(500).json({ error: 'Failed to update medical condition' });
  }
});

// Delete a medical condition
router.delete('/history/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the medical condition belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('medical_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ error: 'Medical condition not found' });
    }

    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting medical condition:', error);
    res.status(500).json({ error: 'Failed to delete medical condition' });
  }
});

module.exports = router; 