import React from 'react';

export const LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCEWGuDUdsnor1dzZWQB9FvqiQ64P2Tm3n3738RlC5FWDjIOlcjej6ivRijzjE5537HhPR-m63OfNWG6g3Loue8hIlTTJ6XGxSrUdD-ABO_y6IJ9TOZRfveOIeHtOcLrJO8JJlZu614rZKLAut8a2obeEM9aghATPYXwGQ3FjaMc3OQbQECNtoh3nGNts/w640-h640/Hamb%C3%BArguer%20Saboroso%20Post%20para%20Instagram%20Moderno%20(2).png";

interface OrbitalLogoProps {
  size?: 'large' | 'small';
}

export const OrbitalLogo: React.FC<OrbitalLogoProps> = ({ size = "large" }) => {
  const outerSize = size === "large" ? "w-32 h-32 md:w-44 md:h-44" : "w-16 h-16 md:w-20 md:h-20";
  const innerSize = size === "large" ? "w-24 h-24 md:w-32 md:h-32" : "w-12 h-12 md:w-14 md:h-14";
  
  return (
    <div className={`relative ${outerSize} flex items-center justify-center shrink-0`}>
      <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_12s_linear_infinite]">
        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_15px_#fff]"></div>
      </div>
      <div className="absolute inset-[-10%] bg-purple-500 rounded-full blur-[25px] opacity-40 animate-pulse"></div>
      <div className={`${innerSize} rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.3)] z-10 bg-black`}>
        <img src={LOGO_URL} alt="JVV" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};
