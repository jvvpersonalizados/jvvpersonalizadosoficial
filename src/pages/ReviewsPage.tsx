import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { GoogleReviewsSection, GoogleReviewsMarquee } from '../components/GoogleReviews';

interface ReviewsPageProps {
  navigate: (page: string) => void;
  t: (br: any, int: any) => any;
  openReviewModal: () => void;
  user: any;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ navigate, t, openReviewModal, user }) => {
  const handleOpenReview = () => {
    if (!user) {
      alert(t("Você precisa entrar na sua conta para deixar uma avaliação.", "You need to log in to your account to leave a review."));
      navigate('user');
    } else {
      openReviewModal();
    }
  };

  return (
    <div className="container mx-auto py-12 md:py-20 animate-fade font-jakarta overflow-hidden">
      <div className="text-center mb-10 md:mb-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
          <svg viewBox="0 0 24 24" width="32" height="32" className="md:w-10 md:h-10" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">{t('Avaliações do Google', 'Google Reviews')}</h2>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-8">{t('O que os clientes falam da JVV Personalizados', 'What customers say about JVV Personalizados')}</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="flex justify-center items-center gap-3 text-3xl font-black text-white">
            5.0 <div className="flex text-yellow-400"><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/></div>
          </div>
          <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
            111+ {t('AVALIAÇÕES REAIS', 'REAL REVIEWS')}
          </div>
          <button onClick={handleOpenReview} className="w-full md:w-auto bg-[var(--theme-primary)] text-white px-8 py-4 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--theme-primary),0.3)]">
            {t('DEIXAR AVALIAÇÃO', 'LEAVE A REVIEW')}
          </button>
        </div>
      </div>
      
      <GoogleReviewsSection t={t} />

      <div className="mt-16 md:mt-20 text-center px-4">
        <button onClick={() => navigate('home')} className="w-full md:w-auto bg-white/5 border border-white/10 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-[var(--theme-primary)] transition-all">
          {t('VOLTAR AO INÍCIO', 'BACK TO HOME')}
        </button>
      </div>
    </div>
  );
};
