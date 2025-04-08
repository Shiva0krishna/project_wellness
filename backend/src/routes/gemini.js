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
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    } else {
      console.log("User Profile:", userProfile);
    }

    // 💬 Fetch chat messages
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("sender, message")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    console.log("Chat History:", messages);

    const conversationHistory = messages?.reverse()
      .map(m => `${m.sender === "user" ? "User" : "Assistant"}: ${m.message}`)
      .join("\n") || "No conversation history.";

    // 📊 Context logs
    let userContextData = "No specific data available for this context.";

    if (context === "Calorie Tracking") {
      const { data: logs, error: calorieError } = await supabase
        .from("daily_calories")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(5);

      if (calorieError) {
        console.error("Error fetching calorie logs:", calorieError);
      } else {
        console.log("Calorie Logs:", logs);
      }
    
      userContextData = logs?.map(c =>
        `• ${c.date}: Consumed ${c.calories_consumed}, Burned ${c.calories_burned}, Net ${c.net_calories}`
      ).join("\n") || userContextData;
    } else if (context === "Sleep Tracking") {
      const { data: logs } = await supabase
        .from("sleep_tracking")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(5);

      console.log("Sleep Logs:", logs);

      userContextData = logs?.map(s =>
        `• ${s.date}: Slept for ${s.hours_slept} hours`
      ).join("\n") || userContextData;

    } else if (context === "Weight Management") {
      const { data: logs } = await supabase
        .from("weight_tracking")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(5);

      console.log("Weight Logs:", logs);

      userContextData = logs?.map(w =>
        `• ${w.date}: Weight = ${w.weight} kg`
      ).join("\n") || userContextData;
    }

    // 📦 Construct final prompt
    const userData = `
User Profile:
- Name: ${userProfile?.name || "N/A"}
- Gender: ${userProfile?.gender || "N/A"}
- Age: ${userProfile?.dob || "N/A"}
- Height: ${userProfile?.height_cm || "N/A"} cm
- Weight: ${userProfile?.weight_kg || "N/A"} kg
- Target Weight: ${userProfile?.target_weight_kg || "N/A"} kg

${context} Logs:
${userContextData}

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
              text: `You are given the following health-related context:\n${userData}\n and ${userContextData}\nNow respond to the user's query:\n"${query}"\n\nBe concise, medium-length, and use bullet points when possible.`,
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
