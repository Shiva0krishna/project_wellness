const express = require("express");
const supabase = require("../utils/db");
const axios = require("axios");

const router = express.Router();

router.post("/query", async (req, res) => {
  const { context, query } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔐 Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    const userId = user.id;
    console.log("Authenticated User ID:", userId);

    if (!context || !query) {
      return res.status(400).json({ error: "Context and query are required." });
    }

    // 🧠 Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) console.error("Error fetching user profile:", profileError);
    else console.log("User Profile:", userProfile);

    // 💬 Fetch recent chat messages
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("sender, message")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const conversationHistory = messages?.reverse()
      .map(m => `${m.sender === "user" ? "User" : "Assistant"}: ${m.message}`)
      .join("\n") || "No conversation history.";

    // 📊 Fetch all logs (Calorie, Sleep, Weight, Diet, Medical History)
    const [calorieRes, sleepRes, weightRes, dietRes, medicalHistoryRes, medicalQueriesRes] = await Promise.all([
      supabase.from("daily_calories").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
      supabase.from("sleep_tracking").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
      supabase.from("weight_tracking").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
      supabase.from("diet_logs").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
      supabase.from("medical_history").select("*").eq("user_id", userId).order("diagnosis_date", { ascending: false }),
      supabase.from("medical_queries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5)
    ]);

    const calorieLogs = calorieRes.data || [];
    const sleepLogs = sleepRes.data || [];
    const weightLogs = weightRes.data || [];
    const dietLogs = dietRes.data || [];
    const medicalHistory = medicalHistoryRes.data || [];
    const medicalQueries = medicalQueriesRes.data || [];

    // 🧠 Format context data
    const calorieData = calorieLogs.map(c =>
      `• ${c.date}: Consumed ${c.calories_consumed}, Burned ${c.calories_burned}, Net ${c.net_calories}`
    ).join("\n");

    const sleepData = sleepLogs.map(s => 
      `• ${s.date}: Slept for ${s.sleep_duration} hours, Quality: ${s.sleep_quality || 'Not recorded'}`
    ).join("\n");

    const weightData = weightLogs.map(w => 
      `• ${w.date}: Weight = ${w.weight} kg`
    ).join("\n");

    const dietData = dietLogs.map(d => 
      `• ${d.date} - ${d.meal}: ${d.food_items} (${d.total_calories} calories)`
    ).join("\n");

    const medicalHistoryData = medicalHistory.map(m => 
      `• ${m.condition} (Diagnosed: ${m.diagnosis_date}): ${m.treatment || 'No treatment'}, Medications: ${m.medications || 'None'}`
    ).join("\n");

    const medicalQueriesData = medicalQueries.map(q => 
      `• Query: ${q.query}\n  Response: ${q.response || 'No response yet'}`
    ).join("\n");

    // 📦 Final prompt
    const userData = `
User Profile:
- Name: ${userProfile?.name || "N/A"}
- Gender: ${userProfile?.gender || "N/A"}
- Age: ${userProfile?.dob ? new Date().getFullYear() - new Date(userProfile.dob).getFullYear() : "N/A"}
- Height: ${userProfile?.height_cm || "N/A"} cm
- Weight: ${userProfile?.weight_kg || "N/A"} kg
- Target Weight: ${userProfile?.target_weight_kg || "N/A"} kg
- Activity Level: ${userProfile?.activity_level || "N/A"}
- Sleep Hours: ${userProfile?.sleep_hours || "N/A"}

Calorie Tracking:
${calorieData}

Sleep Tracking:
${sleepData}

Weight Management:
${weightData}

Diet Logs:
${dietData}

Medical History:
${medicalHistoryData}

Medical Queries:
${medicalQueriesData}

Conversation History:
${conversationHistory}
`;

    console.log("Final Constructed Prompt:", userData);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are given the following health-related context:\n${userData}\n\nNow respond to the user's query:\n"${query}"\n\nBe concise, small to medium-length, and use bullet points when possible.`,
            }
          ]
        }
      ]
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiRes = await axios.post(geminiUrl, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const textResponse = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    console.log("Gemini Response:", textResponse);

    // 💾 Save assistant response
    await supabase.from("chat_messages").insert({
      user_id: userId,
      context_id: null,
      sender: "assistant",
      message: textResponse
    });

    res.status(200).json({ response: textResponse });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Internal server error.",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
