import React from 'react';

export default function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-gray-900 border border-white/10 rounded-2xl p-5 overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      <div className="animate-pulse flex gap-4 w-full h-full items-center">
        <div className="w-10 h-10 bg-white/10 rounded-xl shrink-0"></div>
        <div className="flex-1 flex flex-col gap-2">
            <div className="w-1/2 h-5 bg-white/10 rounded"></div>
            <div className="w-3/4 h-3 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}
