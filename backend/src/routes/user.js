const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  const { name, gender, dob, height_cm, weight_kg, target_weight_kg, activity_level, sleep_hours } = req.body;

  const userId = req.user.id; // Extracted from the token by the middleware
  console.log("User ID from token:", userId);

  try {
    console.log("Checking if user exists in the database...");
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(); // ✅ Prevents errors if no user is found

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return res.status(500).json({ error: "Failed to fetch user.", details: fetchError });
    }

    if (!existingUser) {
      console.warn("User not found in the database.");
      return res.status(404).json({ error: "User not found." });
    }

    console.log("Updating profile for user:", userId);
    console.log("Payload:", { name, gender, dob, height_cm, weight_kg, target_weight_kg, activity_level, sleep_hours });

    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        gender,
        dob,
        height_cm,
        weight_kg,
        target_weight_kg,
        activity_level,
        sleep_hours,
      })
      .eq("user_id", userId)
      .select(); // ✅ Ensures we return updated rows

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(400).json({ error: "Failed to update profile in Supabase.", details: error });
    }

    if (!data || data.length === 0) {
      console.warn("No changes were made to the user profile.");
      return res.status(200).json({ message: "No changes made to the profile." });
    }

    console.log("Update successful:", data);
    res.status(200).json({ message: "Profile updated successfully.", data });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
