"use client";
import { supabase } from "../utils/supabaseClient";

const Login = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Google Sign-in Error:", error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Continue with Google
      </button>
    </div>
  );
};

export default Login;
