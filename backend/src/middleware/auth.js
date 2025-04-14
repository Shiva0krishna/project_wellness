const supabase = require("../utils/db");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: "Unauthorized: No authorization header",
        details: "Please provide an authorization token"
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: "Unauthorized: Invalid token format",
        details: "Please provide a valid Bearer token"
      });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("Token validation error:", error);
      return res.status(401).json({ 
        error: "Unauthorized: Invalid token",
        details: error?.message || "The provided token is invalid or expired"
      });
    }

    // Add the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: "An error occurred while validating your token"
    });
  }
};

module.exports = authenticateUser;
