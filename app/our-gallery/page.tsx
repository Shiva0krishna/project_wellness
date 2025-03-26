import Footer from "../components/footer";
import Navbar from "../components/navbar";

const teamMembers = [
  { name: "John Doe", role: "Team Leader", image: "/browserbase.png" },
  { name: "Jane Smith", role: "Driver", image: "/images/team2.jpg" },
  { name: "Mike Johnson", role: "Mechanic", image: "/images/team3.jpg" },
  { name: "Emily Davis", role: "Aerodynamics Engineer", image: "/images/team4.jpg" },
  { name: "Chris Brown", role: "Battery Management", image: "/images/team5.jpg" },
  { name: "Sarah Wilson", role: "Chassis Designer", image: "/images/team6.jpg" },
  { name: "David Martinez", role: "Electronics Engineer", image: "/images/team7.jpg" },
  { name: "Sophia Lee", role: "Marketing & Sponsorship", image: "/images/team8.jpg" },
];

const OurGallery = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-32">
        <h1 className="text-4xl font-light">Our Go-Kart Team</h1>
        <p className="text-gray-400 mt-4">
          Meet our dedicated team members who bring passion and expertise to our go-kart project.
        </p>
        
        {/* Team Members Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 mx-auto rounded-full object-cover"
              />
              <h2 className="mt-4 text-lg font-semibold">{member.name}</h2>
              <p className="text-gray-400 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Go-Kart Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-light">Gallery</h2>
        <p className="text-gray-400 mt-2">Take a look at our go-kart in action.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          <img src="/images/kart1.jpg" alt="Go-Kart 1" className="w-full h-64 object-cover rounded-lg" />
          <img src="/images/kart2.jpg" alt="Go-Kart 2" className="w-full h-64 object-cover rounded-lg" />
          <img src="/images/kart3.jpg" alt="Go-Kart 3" className="w-full h-64 object-cover rounded-lg" />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OurGallery;
