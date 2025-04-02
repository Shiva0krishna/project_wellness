const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Add weight tracking data
router.post("/weight", authenticateUser, async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("weight_tracking")
      .insert({ user_id: userId, date, weight });

    if (error) {
      console.error("Error inserting weight data:", error);
      return res.status(400).json({ error: "Failed to insert weight data." });
    }

    res.status(201).json({ message: "Weight data added successfully.", data });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Fetch weight tracking data
router.get("/weight", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  console.log("Fetching weight data for user ID:", userId);
  try {
    const { data, error } = await supabase
      .from("weight_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching weight data:", error);
      return res.status(400).json({ error: "Failed to fetch weight data." });
    }

    console.log("Fetched weight data:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Add calorie tracking data
router.post("/calories", authenticateUser, async (req, res) => {
  const { date, calories_consumed, calories_burned } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("daily_calories")
      .insert({ user_id: userId, date, calories_consumed, calories_burned });

    if (error) {
      console.error("Error inserting calorie data:", error);
      return res.status(400).json({ error: "Failed to insert calorie data." });
    }

    res.status(201).json({ message: "Calorie data added successfully.", data });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/calories", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  console.log("Fetching daily calorie data for user ID:", userId);

  try {
    const { data, error } = await supabase
      .from("daily_calories")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching daily calories:", error);
      return res.status(400).json({ error: "Failed to fetch daily calorie data." });
    }

    console.log("Fetched daily calorie data:", data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


// Add sleep tracking data
router.post("/sleep", authenticateUser, async (req, res) => {
  const { date, sleep_duration, sleep_quality } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("sleep_tracking")
      .insert({ user_id: userId, date, sleep_duration, sleep_quality });

    if (error) {
      console.error("Error inserting sleep data:", error);
      return res.status(400).json({ error: "Failed to insert sleep data." });
    }

    res.status(201).json({ message: "Sleep data added successfully.", data });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/sleep", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  console.log("Fetching sleep tracking data for user ID:", userId);

  try {
    const { data, error } = await supabase
      .from("sleep_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching sleep tracking data:", error);
      return res.status(400).json({ error: "Failed to fetch sleep tracking data." });
    }

    console.log("Fetched sleep tracking data:", data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;
