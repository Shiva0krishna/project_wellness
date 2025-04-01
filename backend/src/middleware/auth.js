const supabase = require("../utils/db");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    req.user = data.user; // Attach user info to the request object
    next();
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = authenticateUser;
