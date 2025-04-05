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

// Fetch weight tracking data
export const fetchWeightData = async (token: string) => {
  return sendRequest("/tracking/weight", "GET", token);
};

// Add weight tracking data
export const addWeightData = async (token: string, weightData: any) => {
  return sendRequest("/tracking/weight", "POST", token, weightData);
};

// Fetch calorie tracking data
export const fetchCalorieData = async (token: string) => {
  return sendRequest("/tracking/calories", "GET", token);
};

// Add calorie tracking data
export const addCalorieData = async (token: string, calorieData: any) => {
  return sendRequest("/tracking/calories", "POST", token, calorieData);
};

// Fetch sleep tracking data
export const fetchSleepData = async (token: string) => {
  return sendRequest("/tracking/sleep", "GET", token);
};

// Add sleep tracking data
export const addSleepData = async (token: string, sleepData: any) => {
  return sendRequest("/tracking/sleep", "POST", token, sleepData);
};

// Send query to Gemini API
export const sendGeminiQuery = async (token: string, context: string, query: string) => {
  const response = await sendRequest("/gemini/query", "POST", token, { context, query });
  return response.response; // Assuming the backend returns the response in a `response` field
};
