import Footer from "../components/footer";
import Navbar from "../components/navbar";
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-32">
        <h1 className="text-4xl font-light">About Us</h1>
        <p className="text-gray-400 mt-4">
          Learn more about our mission, vision, and team.
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs;