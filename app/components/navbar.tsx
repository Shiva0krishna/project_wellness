"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Import Link from Next.js
import { Menu, X, Bell } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };

    fetchUser();
  }, []);

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
          P::w
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
            href="/assistant"
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
            href="/nutrition"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative">
              Nutrition
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
            href="/notifications"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
          </Link>
          <Link
            href="/profile"
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <span className="relative flex items-center gap-2">
              <img
                src={user?.user_metadata?.avatar_url || "/default-profile.png"} // Use Google user image or fallback
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
              <span className="absolute -bottom-1 left-0 w-full h-px bg-violet-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
            </span>
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
               <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 relative group"
              >
                Logout
                <span className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {user.user_metadata?.full_name || "User"}
                </span>
              </button>
            </div>
          ) : (
            <div>Loading...</div>
          )}
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
              href="/assistant"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Assistance
            </Link>
            <Link
              href="/track_activity"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Track Activity
            </Link>
            <Link
              href="/nutrition"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Nutrition
            </Link>
            <Link
              href="/browse"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Browse
            </Link>
            <Link
              href="/notifications"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              Notifications
            </Link>
            <Link
              href="/profile"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              onClick={toggleMenu}
            >
              <img
                src={user?.user_metadata?.avatar_url || "/default-profile.png"}
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
              Profile
            </Link>
            {user && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
              >
                Logout ({user.user_metadata?.full_name || "User"})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;