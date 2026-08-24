import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: OrderStatus) => {
    switch (st) {
      case 'DELIVERED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return 'bg-amber-950/60 text-[#D4AF37] border-[#D4AF37]/50';
      case 'ASSIGNED':
      case 'CONFIRMED':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/40';
      case 'FAILED':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/40';
      case 'RESCHEDULED':
        return 'bg-purple-950/60 text-purple-400 border-purple-500/40';
      case 'CANCELLED':
        return 'bg-gray-900 text-gray-400 border-gray-700';
      case 'CREATED':
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )} shadow-sm tracking-wider uppercase`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
