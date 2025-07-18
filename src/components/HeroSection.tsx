import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Play } from 'lucide-react';

const HeroSection: React.FC = () => {
  const scrollToDashboard = () => {
    const element = document.getElementById('dashboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-size animate-grid-move"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            KSpectra
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Your Real-Time Network Visibility Platform
          </p>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Capture, inspect, and analyze network traffic with real-time intelligence.
            Monitor threats, detect anomalies, and secure your network infrastructure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={scrollToDashboard}
            className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Start Monitoring</span>
          </button>
          <button
            onClick={scrollToDashboard}
            className="flex items-center space-x-2 px-6 py-4 border border-slate-600 rounded-lg hover:bg-slate-800/50 transition-all duration-300 text-slate-300 hover:text-white"
          >
            <ArrowDown className="w-5 h-5" />
            <span>View Dashboard</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;