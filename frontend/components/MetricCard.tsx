import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/60 transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#D4AF37] transition-colors">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-[#141417] border border-[#D4AF37]/20 text-[#D4AF37]">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-800 text-[11px] font-mono text-[#D4AF37]">
          {trend}
        </div>
      )}
    </div>
  );
};
