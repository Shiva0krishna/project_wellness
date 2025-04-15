'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { sendGeminiQuery } from '../utils/api';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

const NotificationsPage = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not logged in');

        const response = await sendGeminiQuery(session.access_token, 'recommendations', 'Provide personal recommendations for the user.');
        console.log('Gemini API response:', response);

        // Parse the response into an array of recommendations
        const recommendationsArray = response.split('\n').filter((rec: string) => rec.trim() !== '');
        setRecommendations(recommendationsArray);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900/50 backdrop-blur-md text-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Notifications</h1>
        {loading ? (
          <p className="text-center">Loading Notifications...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <ul className="space-y-4">
            {recommendations.map((rec, index) => (
              <li key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <div className="flex items-center">
                  <span className="text-violet-400 text-2xl mr-4">🔔</span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{rec}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NotificationsPage; 