import React from 'react';
import { GoldDivider } from './GoldDivider';
import { Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#050505] text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GoldDivider />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white font-semibold tracking-wider">LAST-MILE LOGISTICS PLATFORM</span>
          </div>
          <div>
            <span>Precision Volumetric Pricing • Automated Agent Dispatch • Immutable Audit Logging</span>
          </div>
          <div className="text-gray-500">
            © {new Date().getFullYear()} Last-Mile Tracker. Production Edition.
          </div>
        </div>
      </div>
    </footer>
  );
};
