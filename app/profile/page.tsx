"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AuthGuard from "../utils/authGuard";
import { supabase } from "../utils/supabaseClient";
import { updateUserProfile } from "../utils/api";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    height_cm: "",
    weight_kg: "",
    target_weight_kg: "",
    activity_level: "",
    sleep_hours: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFormData({
          name: session.user.user_metadata?.full_name || "",
          gender: session.user.user_metadata?.gender || "",
          dob: session.user.user_metadata?.dob || "",
          height_cm: session.user.user_metadata?.height_cm || "",
          weight_kg: session.user.user_metadata?.weight_kg || "",
          target_weight_kg: session.user.user_metadata?.target_weight_kg || "",
          activity_level: session.user.user_metadata?.activity_level || "",
          sleep_hours: session.user.user_metadata?.sleep_hours || "",
        });
      } else {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      await updateUserProfile(session.access_token, formData);
      console.log("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to update profile:", error.message);
      } else {
        console.error("Failed to update profile:", error);
      }
      console.log("An error occurred while updating the profile.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
        <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg shadow-lg">
          {!isEditing ? (
            <div className="text-center">
              <img
                src={user.user_metadata?.avatar_url || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h1 className="text-3xl font-semibold">{user.user_metadata?.full_name || "User"}</h1>
              <p className="text-gray-400">{user.email}</p>
              <button
                onClick={toggleEdit}
                className="mt-6 py-2 px-4 bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="space-y-6">
              <h1 className="text-3xl font-semibold text-center mb-6">Edit Profile</h1>

              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Name" className="w-full p-2 rounded bg-gray-700 text-white" />

              <select name="gender" value={formData.gender} onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white" />

              <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange}
                placeholder="Height (cm)" className="w-full p-2 rounded bg-gray-700 text-white" />

              <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange}
                placeholder="Weight (kg)" className="w-full p-2 rounded bg-gray-700 text-white" />

              <input type="number" name="target_weight_kg" value={formData.target_weight_kg} onChange={handleChange}
                placeholder="Target Weight (kg)" className="w-full p-2 rounded bg-gray-700 text-white" />

              <select name="activity_level" value={formData.activity_level} onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white">
                <option value="">Select Activity Level</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly active">Lightly active</option>
                <option value="Moderately active">Moderately active</option>
                <option value="Very active">Very active</option>
              </select>

              <input type="number" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange}
                placeholder="Sleep Hours" className="w-full p-2 rounded bg-gray-700 text-white" />

              <button type="button" onClick={handleSave}
                className="w-full py-2 bg-green-500 rounded hover:bg-green-600 transition">
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
};

export default ProfilePage;
