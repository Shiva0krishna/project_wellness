const express = require("express");
const supabase = require("../utils/db");
const authenticateUser = require("../middleware/auth");
const axios = require("axios");

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

// // Generate a personalized response using Gemini API
// router.post("/generate-response", authenticateUser, async (req, res) => {
//   const userId = req.user.id;
//   const { contextId, userMessage } = req.body;

//   try {
//     // Fetch the context name
//     const { data: context, error: contextError } = await supabase
//       .from("chat_contexts")
//       .select("name")
//       .eq("id", contextId)
//       .maybeSingle();

//     if (contextError || !context) {
//       console.error("Error fetching context:", contextError);
//       return res.status(404).json({ error: "Context not found." });
//     }

//     // Fetch user-specific data based on the context
//     let userData = "";
//     if (context.name === "Calorie Tracking") {
//       const calorieResponse = await router.handle({ method: "GET", query: { userId } }, res);
//       userData = `Recent calorie data: ${JSON.stringify(calorieResponse)}`;
//     } else if (context.name === "Sleep Tracking") {
//       const sleepResponse = await router.handle({ method: "GET", query: { userId } }, res);
//       userData = `Recent sleep data: ${JSON.stringify(sleepResponse)}`;
//     } else if (context.name === "Weight Management") {
//       const weightResponse = await router.handle({ method: "GET", query: { userId } }, res);
//       userData = `Recent weight data: ${JSON.stringify(weightResponse)}`;
//     }

//     // Combine user data and user message for the Gemini API
//     const prompt = `Context: ${context.name}\nUser Data: ${userData}\nUser Message: ${userMessage}`;

//     // Call the Gemini API
//     const geminiResponse = await axios.post(
//       process.env.GEMINI_API_URL,
//       { prompt },
//       { headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` } }
//     );

//     const assistantMessage = geminiResponse.data.response;

//     // Save the assistant's response in the database
//     const { data: savedMessage, error: saveError } = await supabase
//       .from("chat_messages")
//       .insert({
//         context_id: contextId,
//         sender: "assistant",
//         message: assistantMessage,
//       })
//       .select();

//     if (saveError) {
//       console.error("Error saving assistant message:", saveError);
//     }

//     res.status(200).json({ response: assistantMessage });
//   } catch (error) {
//     console.error("Error generating response:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Delete a context
router.delete('/contexts/:name', authenticateUser, async (req, res) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);

    // First check if the context belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('chat_contexts')
      .select('*')
      .eq('name', decodedName)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ error: 'Context not found' });
    }

    // Delete all messages associated with this context
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('context_id', existingData.id);

    if (messagesError) throw messagesError;

    // Delete the context
    const { error } = await supabase
      .from('chat_contexts')
      .delete()
      .eq('name', decodedName)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting context:', error);
    res.status(500).json({ error: 'Failed to delete context' });
  }
});

module.exports = router;
