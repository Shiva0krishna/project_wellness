const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Fetch user profile
router.get("/profile", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  console.log("Fetching profile for user ID:", userId);

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        gender,
        dob,
        height_cm,
        weight_kg,
        target_weight_kg,
        activity_level,
        sleep_hours,
        created_at
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ error: "Failed to fetch user profile.", details: error });
    }

    if (!user) {
      console.warn("User not found in the database.");
      return res.status(404).json({ error: "User not found." });
    }

    // Add user metadata from auth
    const profile = {
      ...user,
      email: req.user.email,
      full_name: req.user.user_metadata?.full_name || null,
      avatar_url: req.user.user_metadata?.avatar_url || null
    };

    console.log("User profile fetched successfully:", profile);
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  const { gender, dob, height_cm, weight_kg, target_weight_kg, activity_level, sleep_hours } = req.body;

  const userId = req.user.id;
  console.log("User ID from token:", userId);

  try {
    console.log("Checking if user exists in the database...");
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return res.status(500).json({ error: "Failed to fetch user.", details: fetchError });
    }

    if (!existingUser) {
      console.warn("User not found in the database.");
      return res.status(404).json({ error: "User not found." });
    }

    console.log("Updating profile for user:", userId);
    console.log("Payload:", { gender, dob, height_cm, weight_kg, target_weight_kg, activity_level, sleep_hours });

    const { data, error } = await supabase
      .from("users")
      .update({
        gender,
        dob,
        height_cm,
        weight_kg,
        target_weight_kg,
        activity_level,
        sleep_hours,
      })
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(400).json({ error: "Failed to update profile in Supabase.", details: error });
    }

    if (!data || data.length === 0) {
      console.warn("No changes were made to the user profile.");
      return res.status(200).json({ message: "No changes made to the profile." });
    }

    // Add user metadata to response
    const updatedProfile = {
      ...data[0],
      email: req.user.email,
      full_name: req.user.user_metadata?.full_name || null,
      avatar_url: req.user.user_metadata?.avatar_url || null
    };

    console.log("Update successful:", updatedProfile);
    res.status(200).json({ message: "Profile updated successfully.", data: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
