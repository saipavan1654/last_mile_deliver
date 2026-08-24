import React from 'react';

export const GoldDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />
      </div>
    </div>
  );
};
