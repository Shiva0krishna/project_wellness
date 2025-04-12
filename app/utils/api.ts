export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Helper function to send API requests
const sendRequest = async (endpoint: string, method: string, token: string, body?: any) => {
  // console.log("Making API request to:", endpoint);
  // console.log("With token:", token);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  console.log("Request headers:", headers);

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    credentials: 'include', 
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error: ${response.status} - ${errorText || response.statusText}`);
  }

  return response.json();
};


// Helper function to send multipart form data requests (for file uploads)
const sendMultipartRequest = async (endpoint: string, method: string, token: string, formData: FormData) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    body: formData,
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

// Assistant: Fetch all contexts
export const getContexts = async (token: string) => {
  return sendRequest("/assistant/contexts", "GET", token);
};

// Assistant: Create a new context
export const createContext = async (token: string, contextData: { id: string; name: string }) => {
  return sendRequest("/assistant/contexts", "POST", token, contextData);
};

// Assistant: Fetch messages for a given context
export const getMessages = async (token: string, contextId: string) => {
  return sendRequest(`/assistant/messages?contextId=${contextId}`, "GET", token);
};

// Assistant: Add a new message to a context
export const addMessage = async (
  token: string,
  messageData: { contextId: string; sender: string; message: string }
) => {
  return sendRequest("/assistant/messages", "POST", token, messageData);
};

// Nutrition: Analyze food text for nutritional content
export const analyzeNutritionText = async (token: string, foodText: string) => {
  return sendRequest("/nutrition/analyze-text", "POST", token, { foodText });
};

// Medical History: Fetch user's medical history
export const fetchMedicalHistory = async (token: string) => {
  return sendRequest("/medical/history", "GET", token);
};

// Medical History: Add a new medical condition
export const addMedicalCondition = async (token: string, conditionData: {
  condition: string;
  diagnosis_date: string;
  treatment?: string;
  medications?: string;
}) => {
  return sendRequest("/medical/history", "POST", token, conditionData);
};

// Medical History: Update a medical condition
export const updateMedicalCondition = async (token: string, id: string, conditionData: {
  condition: string;
  diagnosis_date: string;
  treatment?: string;
  medications?: string;
}) => {
  return sendRequest(`/medical/history/${id}`, "PUT", token, conditionData);
};

// Medical History: Delete a medical condition
export const deleteMedicalCondition = async (token: string, id: string) => {
  return sendRequest(`/medical/history/${id}`, "DELETE", token);
};

// Nutrition: Log a meal with nutrition data
export const logNutrition = async (token: string, nutritionData: {
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  food_items: string[];
  total_calories: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
}) => {
  return sendRequest("/nutrition/log", "POST", token, nutritionData);
};

// Nutrition: Fetch user's nutrition logs
export const fetchNutritionLogs = async (token: string, startDate?: string, endDate?: string) => {
  let endpoint = "/nutrition/logs";
  if (startDate && endDate) {
    endpoint += `?startDate=${startDate}&endDate=${endDate}`;
  }
  return sendRequest(endpoint, "GET", token);
};

// Nutrition: Delete a nutrition log
export const deleteNutritionLog = async (token: string, logId: string) => {
  return sendRequest(`/nutrition/logs/${logId}`, "DELETE", token);
};

// Assistant: Delete a context
export const deleteContext = async (token: string, contextName: string) => {
  return sendRequest(`/assistant/contexts/${encodeURIComponent(contextName)}`, "DELETE", token);
};

// News: Fetch health news
export const fetchHealthNews = async () => {
  return sendRequest("/news/health", "GET", "");
};
