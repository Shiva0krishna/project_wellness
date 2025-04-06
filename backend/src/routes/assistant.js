const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Fetch all contexts for the authenticated user
router.get("/contexts", authenticateUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: contexts, error } = await supabase
      .from("chat_contexts")
      .select("id, name, created_at")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching contexts:", error);
      return res.status(500).json({ error: "Failed to fetch contexts." });
    }

    res.status(200).json(contexts);
  } catch (error) {
    console.error("Error fetching contexts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new context for the authenticated user
router.post("/contexts", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { id, name } = req.body;

  try {
    const { data, error } = await supabase
      .from("chat_contexts")
      .insert({ id, user_id: userId, name })
      .select();

    if (error) {
      console.error("Error creating context:", error);
      return res.status(500).json({ error: "Failed to create context." });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating context:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all messages for a specific context
router.get("/messages", authenticateUser, async (req, res) => {
  const { contextId } = req.query;

  try {
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, sender, message, created_at")
      .eq("context_id", contextId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new message to a specific context
router.post("/messages", authenticateUser, async (req, res) => {
  const { contextId, sender, message } = req.body;

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ context_id: contextId, sender, message })
      .select();

    if (error) {
      console.error("Error adding message:", error);
      return res.status(500).json({ error: "Failed to add message." });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
