"use client";
import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AuthGuard from "../utils/authGuard";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    stepsGoal: 5000,
    heartPointsGoal: 20,
    bedtimeSchedule: true,
    getInBed: "23:00",
    wakeUp: "07:00",
    gender: "Male",
    birthday: "2004-10-21",
    weight: 72,
    height: "5'10\"",
    bloodType: "O+",
    allergies: "",
    medicalConditions: "",
    medications: "",
  });

  const handleChange = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
        <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center mb-6">Profile</h1>
          
          <form className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Activity Goals</h2>
              <label className="block mb-2">Steps Goal</label>
              <input
                type="number"
                value={profileData.stepsGoal}
                onChange={(e) => handleChange("stepsGoal", parseInt(e.target.value))}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2">Heart Points Goal</label>
              <input
                type="number"
                value={profileData.heartPointsGoal}
                onChange={(e) => handleChange("heartPointsGoal", parseInt(e.target.value))}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Bedtime Schedule</h2>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={profileData.bedtimeSchedule}
                  onChange={(e) => handleChange("bedtimeSchedule", e.target.checked)}
                />
                Enable
              </label>
              {profileData.bedtimeSchedule && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Get in Bed</label>
                    <input
                      type="time"
                      value={profileData.getInBed}
                      onChange={(e) => handleChange("getInBed", e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Wake Up</label>
                    <input
                      type="time"
                      value={profileData.wakeUp}
                      onChange={(e) => handleChange("wakeUp", e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">About You</h2>
              <label className="block mb-2">Gender</label>
              <select
                value={profileData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Birthday</label>
              <input
                type="date"
                value={profileData.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-2">Height</label>
                <input
                  type="text"
                  value={profileData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Blood Type</label>
              <select
                value={profileData.bloodType}
                onChange={(e) => handleChange("bloodType", e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              >
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Allergies</label>
              <textarea
                value={profileData.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              />
            </div>

            <button className="w-full py-2 bg-blue-500 rounded hover:bg-blue-600 transition">
              Save Profile
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
};

export default ProfilePage;