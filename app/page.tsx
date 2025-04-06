"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/navbar";

const GrainOverlay = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-50 pointer-events-none opacity-[0.15]">
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 2056 2056' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backdropFilter: "contrast(120%) brightness(95%)", mixBlendMode: "overlay" }}
      />
    </div>
  );
};

const Portfolio = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((position / height) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-gray-100 overflow-hidden">
      <GrainOverlay />
      <Navbar />

      <div className="relative z-10 min-h-screen backdrop-contrast-110 backdrop-brightness-95">
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-7xl mx-auto px-4 py-32 z-20"
          >
            <motion.h1 className="text-5xl md:text-7xl font-extralight mb-6 tracking-tight leading-tight">
              Activity Goals To Improve Health
            </motion.h1>
            <motion.p className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-8 font-light">
              Coaching that fits you. Achieve your fitness goals through customised coaching and actionable tips based on your health and activity history.
            </motion.p>
          </motion.div>
        </section>

        <footer className="border-t border-gray-800/20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Portfolio;
