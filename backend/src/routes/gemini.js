const express = require("express");
const supabase = require("../utils/db");
const authenticateUser  = require("../middleware/auth");
const axios = require("axios"); 

const router = express.Router();

router.post("/query", authenticateUser, async (req, res) => {
  const { context, query } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Authenticate user using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    if (!context || !query) {
      return res.status(400).json({ error: "Context and query are required." });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are given the following context:\n${context}\n\nNow, respond to the query:\n${query}\n\nPlease ensure your response is precise and concise,medium size answers in bullet points are preferred.`,
            }
          ]
        }
      ]
    };

    const geminiRes = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const textResponse = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    console.log("Gemini Response:", textResponse);
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
