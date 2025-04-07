"use client";
import Navbar from "../components/navbar";
import AuthGuard from "../utils/authGuard";

const Browse = () => {
  return (
    <AuthGuard>
      <Navbar/>
      <div className="pt-16 px-4 md:px-10 bg-gray-900 text-white min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Health & Wellness Hub</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health News */}
          <section className="bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">📰 Latest Health News</h2>
            <ul className="space-y-2 text-gray-300 text-base leading-relaxed">
              <li>• WHO declares 2025 the year of Digital Health Transformation.</li>
              <li>• Study reveals strong link between quality sleep and heart health.</li>
              <li>• AI technology helps detect early signs of Alzheimer’s.</li>
              <li>• New dietary guidelines introduced to tackle global obesity rise.</li>
            </ul>
          </section>

          {/* WHO Guidelines */}
          <section className="bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">📜 WHO Guidelines</h2>
            <ul className="list-disc list-inside text-gray-300 text-base leading-relaxed">
              <li>Eat a variety of nutritious foods daily including fruits and vegetables.</li>
              <li>Limit salt, sugar, and saturated fat intake.</li>
              <li>Exercise for at least 150 minutes per week.</li>
              <li>Maintain regular health checkups and vaccinations.</li>
              <li>Prioritize mental health and sleep hygiene.</li>
            </ul>
          </section>

          {/* Daily Tips */}
          <section className="bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🧠 Daily Health Tips</h2>
            <ul className="space-y-2 text-gray-300 text-base leading-relaxed">
              <li>• Start your day with a glass of water and light stretching.</li>
              <li>• Use the 20-20-20 rule to protect your eyes during screen time.</li>
              <li>• Practice 5 minutes of mindfulness or deep breathing daily.</li>
              <li>• Replace sugary drinks with natural juices or herbal tea.</li>
              <li>• Stand up and move every 30 minutes if you're sitting long hours.</li>
            </ul>
          </section>

          {/* Trusted Resources */}
          <section className="bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">📚 Trusted Medical Resources</h2>
            <ul className="space-y-3 text-blue-400 text-base leading-relaxed underline">
              <li>
                <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer">
                  World Health Organization (WHO)
                </a>
              </li>
              <li>
                <a href="https://www.cdc.gov/" target="_blank" rel="noopener noreferrer">
                  Centers for Disease Control and Prevention (CDC)
                </a>
              </li>
              <li>
                <a href="https://www.mayoclinic.org/" target="_blank" rel="noopener noreferrer">
                  Mayo Clinic
                </a>
              </li>
              <li>
                <a href="https://www.healthline.com/" target="_blank" rel="noopener noreferrer">
                  Healthline
                </a>
              </li>
            </ul>
          </section>
        </div>

        <p className="text-sm text-gray-500 text-center mt-10">
          This space is designed to educate and empower you with medically reviewed and globally trusted content.
        </p>
      </div>
    </AuthGuard>
  );
};

export default Browse;
