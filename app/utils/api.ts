export const API_BASE_URL = "http://localhost:5000/api";
// Helper function to send API requests
const sendRequest = async (endpoint: string, method: string, token: string, body?: any) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
};

// Fetch user profile
export const fetchUserProfile = async (token: string) => {
  return sendRequest("/user/profile", "GET", token);
};

// Update user profile
export const updateUserProfile = async (token: string, profileData: any) => {
  console.log("Updating user profile with data:", profileData);
  return sendRequest("/user/profile", "PUT", token, profileData);
};
