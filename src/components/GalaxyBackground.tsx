import React from 'react';

export const GalaxyBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020105]">
    <div className="absolute inset-0 z-0">
      <div className="absolute w-[700px] h-[700px] bg-gradient-to-br from-[#9333ea] to-[#4f46e5] blur-[140px] rounded-full opacity-20 -translate-x-1/4 -translate-y-1/4 animate-pulse"></div>
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#db2777] to-[#9333ea] blur-[140px] rounded-full opacity-15 right-[-100px] top-[-100px] animate-pulse"></div>
    </div>
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(1px 1px at 15% 15%, #fff, transparent), radial-gradient(1px 1px at 85% 35%, #fff, transparent)", backgroundSize: "400px 400px" }}></div>
  </div>
);
