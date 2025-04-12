const supabase = require("../utils/db");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided or invalid format");
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  try {
    console.log("Attempting to validate token with Supabase...");
    const { data, error } = await supabase.auth.getUser(token);
    console.log("Supabase auth response:", { data, error });

    if (error || !data) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    const userId = data.user.id;
    
    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (userError && userError.code !== "PGRST116") { // PGRST116 is "not found" error
      console.error("Error checking user existence:", userError);
      return res.status(500).json({ error: "Internal server error" });
    }

    // If user doesn't exist, create them with minimal data
    if (!existingUser) {
      console.log("Creating new user record for:", userId);
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId  // This matches the auth.users(id) reference
        });

      if (insertError) {
        console.error("Error creating user record:", insertError);
        return res.status(500).json({ error: "Failed to create user record" });
      }
    }

    req.user = data.user; // Attach user info to the request object
    next();
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = authenticateUser;
