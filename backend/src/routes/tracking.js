const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Add weight tracking data
router.post("/weight", authenticateUser, async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.user.id;
  
  console.log("Received weight data:", { date, weight, userId });

  if (!date || !weight) {
    console.log("Missing required fields");
    return res.status(400).json({ error: "Date and weight are required." });
  }

  try {
    const { data, error } = await supabase
      .from("weight_tracking")
      .insert({ user_id: userId, date, weight });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Error inserting weight data:", error);
      return res.status(400).json({ error: "Failed to insert weight data.", details: error });
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

// Update calorie tracking data
router.put("/calories/:date", authenticateUser, async (req, res) => {
  const { calories_consumed, calories_burned } = req.body;
  const userId = req.user.id;
  const date = req.params.date;

  try {
    const { data, error } = await supabase
      .from("daily_calories")
      .update({ calories_consumed, calories_burned })
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error("Error updating calorie data:", error);
      return res.status(400).json({ error: "Failed to update calorie data." });
    }

    res.status(200).json({ message: "Calorie data updated successfully.", data });
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

// Get activity tracking data
router.get("/activity", authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("activity_tracking")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching activity data:", error);
    res.status(500).json({ error: "Failed to fetch activity data" });
  }
});

// Get activity summary data
router.get("/activity/summary", authenticateUser, async (req, res) => {
  try {
    // Get the date range from query parameters or default to last 30 days
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Fetching activity summary from ${startDate} to ${endDate}`);
    
    // First try to query the view
    let { data, error } = await supabase
      .from("daily_activity_summary")
      .select("*")
      .eq("user_id", req.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    // If the view doesn't exist, calculate the summary directly
    if (error && error.message.includes("relation \"daily_activity_summary\" does not exist")) {
      console.log("View doesn't exist, calculating summary directly");
      const { data: activityData, error: activityError } = await supabase
        .from("activity_tracking")
        .select("*")
        .eq("user_id", req.user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (activityError) throw activityError;

      // Group the data by date
      const summaryByDate = activityData.reduce((acc, activity) => {
        const date = activity.date;
        if (!acc[date]) {
          acc[date] = {
            user_id: activity.user_id,
            date,
            total_activities: 0,
            total_duration: 0,
            total_calories_burned: 0,
            activities_performed: new Set()
          };
        }
        acc[date].total_activities += 1;
        acc[date].total_duration += activity.duration_minutes;
        acc[date].total_calories_burned += activity.calories_burned;
        acc[date].activities_performed.add(activity.activity_type);
        return acc;
      }, {});

      // Convert Set to Array for activities_performed
      data = Object.values(summaryByDate).map(summary => ({
        ...summary,
        activities_performed: Array.from(summary.activities_performed)
      }));
      error = null;
    }

    if (error) {
      console.error("Error fetching activity summary:", error);
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching activity summary:", error);
    res.status(500).json({ error: "Failed to fetch activity summary" });
  }
});

// Add or update activity tracking data
router.post("/activity", authenticateUser, async (req, res) => {
  try {
    console.log("Backend: Received activity data:", req.body);
    
    const { date, activity_type, duration_minutes, intensity, calories_burned, description } = req.body;

    if (!date || !activity_type || !duration_minutes) {
      console.log("Backend: Missing required fields:", { 
        date: !!date, 
        activity_type: !!activity_type, 
        duration_minutes: !!duration_minutes 
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Backend: Processing activity data:", { date, activity_type, duration_minutes, intensity, calories_burned, description });

    // Insert new activity entry
    const { error: insertError } = await supabase.from("activity_tracking").insert({
      user_id: req.user.id,
      date,
      activity_type,
      duration_minutes,
      intensity,
      calories_burned,
      description,
    });

    if (insertError) {
      console.error("Backend: Error inserting activity:", insertError);
      throw insertError;
    }

    res.json({ message: "Activity data saved successfully" });
  } catch (error) {
    console.error("Backend: Error saving activity data:", error);
    res.status(500).json({ error: "Failed to save activity data" });
  }
});

// Helper function to calculate calories burned based on activity type, duration, and intensity
function calculateCaloriesBurned(activityType, duration, intensity, userProfile = null) {
  // MET values for different activities and intensities
  const metValues = {
    running: { light: 6.0, moderate: 8.3, vigorous: 9.8, very_vigorous: 11.8 },
    walking: { light: 2.9, moderate: 3.5, vigorous: 4.3, very_vigorous: 5.0 },
    cycling: { light: 3.5, moderate: 5.5, vigorous: 7.0, very_vigorous: 10.0 },
    swimming: { light: 3.5, moderate: 6.0, vigorous: 8.3, very_vigorous: 10.0 },
    gym: { light: 3.5, moderate: 5.0, vigorous: 7.0, very_vigorous: 9.0 },
    yoga: { light: 2.5, moderate: 3.0, vigorous: 4.0, very_vigorous: 5.0 },
    dancing: { light: 3.0, moderate: 4.8, vigorous: 7.0, very_vigorous: 9.0 },
    sports: { light: 4.0, moderate: 6.0, vigorous: 8.0, very_vigorous: 10.0 },
    hiking: { light: 3.5, moderate: 5.0, vigorous: 6.5, very_vigorous: 8.0 },
    other: { light: 3.0, moderate: 4.0, vigorous: 6.0, very_vigorous: 8.0 }
  };
  
  // Default weight if user profile is not available
  const weight = userProfile?.weight || 70; // Default 70 kg
  
  // Get MET value for the activity and intensity
  const met = metValues[activityType]?.[intensity] || metValues.other[intensity];
  
  // Calculate calories burned: Calories = MET × Weight (kg) × Duration (hours)
  const durationHours = parseInt(duration) / 60;
  const calories = Math.round(met * weight * durationHours);
  
  return calories;
}

module.exports = router;
