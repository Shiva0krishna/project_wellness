const Footer = () => {
  return (
    <footer className="border-t border-gray-800/20 bg-zinc-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} P::Health. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;