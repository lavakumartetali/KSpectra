import React from 'react';
import { Shield, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              KSpectra
            </span>
          </div>
          <p className="text-slate-400 mb-4">
            Real-time network monitoring and threat detection platform
          </p>
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <span>© 2025 KSpectra by Lava Kumar. All rights reserved.</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-2 text-slate-500">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>and cutting-edge technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;