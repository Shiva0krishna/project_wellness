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

    try {
      // First try to get the user directly from the token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error("Token validation error:", error);
        // Try to refresh the session if the token is expired
        const { data: { session }, error: refreshError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token // Using access token as refresh token since we don't have the actual refresh token
        });

        if (refreshError || !session) {
          return res.status(401).json({ 
            error: "Unauthorized: Invalid token",
            details: "Your session has expired. Please log in again."
          });
        }

        req.user = session.user;
      } else {
        req.user = user;
      }

      next();
    } catch (tokenError) {
      console.error("Token processing error:", tokenError);
      return res.status(401).json({ 
        error: "Unauthorized: Invalid token",
        details: "Unable to verify your authentication token"
      });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: "An error occurred while validating your token"
    });
  }
};

module.exports = authenticateUser;
