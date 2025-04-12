"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import AuthGuard from "../utils/authGuard";
import { fetchHealthNews } from "../utils/api";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: string;
}

const Browse = () => {
  const [healthNews, setHealthNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHealthNews = async () => {
      try {
        setLoading(true);
        const news = await fetchHealthNews();
        setHealthNews(news);
      } catch (err) {
        console.error("Error fetching health news:", err);
        setError("Failed to load health news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHealthNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <AuthGuard>
      <Navbar/>
      <div className="pt-16 px-4 md:px-10 bg-gray-900 text-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Health & Wellness Hub</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stay informed with the latest medical research, health tips, and wellness guidelines
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Health News - Takes up 2 columns on large screens */}
            <section className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <span className="mr-2">📰</span> Latest Health News
                </h2>
                <div className="text-sm text-gray-400">
                  Updated daily
                </div>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-sm underline hover:text-red-200"
                  >
                    Try again
                  </button>
                </div>
              ) : healthNews.length > 0 ? (
                <div className="space-y-6">
                  {healthNews.map((article, index) => (
                    <article 
                      key={index} 
                      className="border-b border-gray-700 pb-6 last:border-0 last:pb-0"
                    >
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-700 p-4 rounded-lg transition duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {article.image && (
                            <div className="md:w-1/4 h-40 overflow-hidden rounded-lg">
                              <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className={article.image ? "md:w-3/4" : "w-full"}>
                            <h3 className="font-medium text-xl text-blue-300 mb-2">{article.title}</h3>
                            <p className="text-gray-300 mb-3">{article.description}</p>
                            <div className="flex justify-between text-sm text-gray-400">
                              <span className="font-medium">{article.source}</span>
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No health news available at the moment.</p>
                </div>
              )}
            </section>

            {/* Sidebar with additional information */}
            <div className="space-y-8">
              {/* WHO Guidelines */}
              <section className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📜</span> WHO Guidelines
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Eat a variety of nutritious foods daily including fruits and vegetables.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Limit salt, sugar, and saturated fat intake.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Exercise for at least 150 minutes per week.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Maintain regular health checkups and vaccinations.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Prioritize mental health and sleep hygiene.</span>
                  </li>
                </ul>
              </section>

              {/* Daily Tips */}
              <section className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">🧠</span> Daily Health Tips
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Start your day with a glass of water and light stretching.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Use the 20-20-20 rule to protect your eyes during screen time.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Practice 5 minutes of mindfulness or deep breathing daily.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Replace sugary drinks with natural juices or herbal tea.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Stand up and move every 30 minutes if you're sitting long hours.</span>
                  </li>
                </ul>
              </section>

              {/* Trusted Resources */}
              <section className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📚</span> Trusted Medical Resources
                </h2>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.who.int/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                      <span className="mr-2">•</span>
                      <span>World Health Organization (WHO)</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.cdc.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                      <span className="mr-2">•</span>
                      <span>Centers for Disease Control and Prevention (CDC)</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.mayoclinic.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                      <span className="mr-2">•</span>
                      <span>Mayo Clinic</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.healthline.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                      <span className="mr-2">•</span>
                      <span>Healthline</span>
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <footer className="text-center py-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              This space is designed to educate and empower you with medically reviewed and globally trusted content.
            </p>
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Browse;
