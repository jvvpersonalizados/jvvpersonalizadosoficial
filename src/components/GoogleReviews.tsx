import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { getGoogleReviews } from '../constants/reviews';

interface Review {
  id: number;
  name: string;
  date: string;
  text: string;
  rating: number;
}

interface GoogleReviewsProps {
  t: (br: any, int: any) => any;
}

export const GoogleReviewsMarquee: React.FC<GoogleReviewsProps> = ({ t }) => {
  const googleReviews = getGoogleReviews(t);

  return (
    <div className="relative w-full overflow-hidden flex flex-col gap-4 md:gap-6 py-6 md:py-10 mt-2 md:mt-4">
      <div className="absolute inset-y-0 left-0 w-12 md:w-40 bg-gradient-to-r from-[#020105] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 md:w-40 bg-gradient-to-l from-[#020105] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex gap-4 md:gap-6 whitespace-nowrap animate-ticker hover:[animation-play-state:paused] w-max">
        {[...googleReviews, ...googleReviews].map((r: any, idx) => (
          <div key={idx} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[28px] md:rounded-3xl w-[280px] md:w-[450px] shrink-0 whitespace-normal shadow-2xl hover:bg-white/[0.05] transition-all duration-300">
            <div className="flex justify-between items-start mb-4 md:mb-5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${r.color || 'from-purple-600 to-blue-600'} rounded-full flex items-center justify-center font-black text-lg md:text-xl text-white shadow-lg`}>{r.initials || r.name.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-white text-xs md:text-sm flex items-center gap-1.5">
                    {r.name}
                    <BadgeCheck size={14} className="text-blue-500 md:w-4 md:h-4" fill="currentColor" stroke="white" strokeWidth={1.5} />
                  </h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 md:mt-1">{r.date}</p>
                </div>
              </div>
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-4 h-4 md:w-5 md:h-5 opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex text-yellow-400 mb-3 md:mb-4">
              {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="md:w-4 md:h-4" fill="currentColor" />)}
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium italic">"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GoogleReviewsSection: React.FC<GoogleReviewsProps> = ({ t }) => {
  const googleReviews = getGoogleReviews(t);

  return (
    <div className="w-full py-6 mt-4">
      {/* Google Rating Summary */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 mb-12 bg-white/[0.02] border border-white/5 p-8 rounded-[32px] backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="text-5xl md:text-6xl font-black text-white mb-2">5.0</div>
          <div className="flex text-yellow-400 mb-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
          </div>
          <div className="text-slate-400 text-sm font-medium">111+ {t("avaliações no Google", "Google reviews")}</div>
        </div>
        <div className="hidden md:block w-px h-24 bg-white/10"></div>
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
            <span className="text-white font-bold text-xl">Google Reviews</span>
          </div>
          <p className="text-slate-400 text-center md:text-left max-w-md">
            {t("Nossa reputação é construída com base na satisfação real de nossos clientes. Qualidade garantida em cada detalhe.", "Our reputation is built on the real satisfaction of our customers. Guaranteed quality in every detail.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {googleReviews.map((r: any, idx) => (
          <div key={idx} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[28px] shadow-2xl hover:border-purple-500/50 hover:bg-white/[0.05] transition-all duration-500 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4 md:mb-5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${r.color || 'from-purple-600 to-blue-600'} rounded-full flex items-center justify-center font-black text-lg md:text-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>{r.initials || r.name.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-white text-xs md:text-sm flex items-center gap-1.5">
                    {r.name}
                    <BadgeCheck size={14} className="text-blue-500 md:w-4 md:h-4" fill="currentColor" stroke="white" strokeWidth={1.5} />
                  </h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 md:mt-1">{r.date}</p>
                </div>
              </div>
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-4 h-4 md:w-5 md:h-5 opacity-60 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex text-yellow-400 mb-3 md:mb-4">
              {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="md:w-4 md:h-4" fill="currentColor" />)}
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium flex-1 italic">"{r.text}"</p>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                {t("Cliente Verificado", "Verified Customer")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
