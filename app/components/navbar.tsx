"use client";
import React, { useState } from "react";
import Link from "next/link"; // Import Link from Next.js
import { Menu, X } from "lucide-react";
import { div, span } from "framer-motion/client";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed w-full z-40 backdrop-blur-md bg-gray-900/50">
      <div className="max-w-8xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-light tracking-wider hover:text-violet-400 transition-colors"
        >
          FT-25
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              Home
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
          <Link
            href="/assistance"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              Assistance
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
          <Link
            href="/track_activity"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              Track Activity
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
          <Link
            href="/browse"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              Browse
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
            <Link
            href="/profile"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
            >
            <span className="relative flex items-center gap-2">
              <img
              src="/browserbase.png"
              alt="Profile"
              className="w-6 h-6 rounded-full"
              />
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
            </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/90 backdrop-blur-md absolute top-16 left-0 w-full z-30">
          <div className="flex flex-col items-center space-y-4 py-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              About Us
            </Link>
            <Link
              href="/our-partners"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Our Partners
            </Link>
            <Link
              href="/our-gallery"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Our Gallery
            </Link>
            <Link
              href="/race-with-us"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Race with Us
            </Link>
            <Link
              href="/contact-us"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;