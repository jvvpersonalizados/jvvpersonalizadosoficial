import React, { useState, useRef } from 'react';
import { X, Star, CheckCircle, Camera } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (br: any, int: any) => any;
  onSubmit: (data: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, t, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const googleReviewLink = "https://www.google.com/search?gs_ssp=eJzj4tVP1zc0TC6KLypKyjAxYLRSNaiwNElKskxMMTdKS05NMTcxtDKoSDUyMzMzMrEwTjJJNEsyNvUSyiorUyhILSrOz0vMyaxKTMkvBgAuFBb2&q=jvv+personalizados&oq=jvv&gs_lcrp=EgZjaHJvbWUqFQgCEC4YJxivARjHARiABBiKBRiOBTIGCAAQRRg8MgkIARBFGDkYgAQyFQgCEC4YJxivARjHARiABBiKBRiOBTIGCAMQRRg8MgYIBBBFGD0yBggFEEUYPTIGCAYQRRg9MgYIBxBFGDzSAQgxNTIwajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#";

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ rating, text, photo });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setText('');
      setPhoto(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4 font-jakarta animate-fade">
      <div className="bg-white/[0.03] border border-white/10 p-6 md:p-10 rounded-[30px] md:rounded-[40px] max-w-[95%] md:max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 md:top-6 right-4 md:right-6 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        
        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-2">{t('Sua', 'Your')} <span className="text-[#9333ea]">{t('Experiência', 'Experience')}</span></h2>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 md:mb-8">{t('Compartilhe sua jornada com a JVV', 'Share your journey with JVV')}</p>
        
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 animate-fade">
            <CheckCircle size={48} className="text-[#00ff88] mb-4" />
            <p className="text-lg font-black text-white uppercase tracking-widest">{t('Obrigado!', 'Thank You!')}</p>
            <p className="text-xs text-slate-400 mt-2 font-bold text-center">{t('Avaliação enviada com sucesso.', 'Review submitted successfully.')}</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-1 md:gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={32} 
                  className={`cursor-pointer transition-all hover:scale-110 ${(hoverRating || rating) >= star ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-600'}`}
                  fill={(hoverRating || rating) >= star ? 'currentColor' : 'transparent'}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder={t('Conte-nos sobre a qualidade, atendimento e entrega...', 'Tell us about the quality, service, and delivery...')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs md:text-sm outline-none focus:border-[#9333ea] min-h-[100px] resize-none font-medium"
            />

            <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2 md:p-3 rounded-2xl">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                  {photo ? <img src={photo} className="w-full h-full object-cover rounded-xl" alt="upload" /> : <Camera size={14} />}
                </div>
                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  {photo ? t('Foto anexada', 'Photo attached') : t('Adicionar foto', 'Add photo')}
                </span>
              </div>
              <button onClick={() => fileRef.current?.click()} className="text-[9px] md:text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all">
                {photo ? t('Trocar', 'Change') : t('Escolher', 'Choose')}
              </button>
              <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => { if(e.target.files?.[0]) setPhoto(URL.createObjectURL(e.target.files[0])) }} />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full py-3.5 md:py-4 bg-[#9333ea] text-white font-black uppercase tracking-widest rounded-full hover:bg-[#a855f7] transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-[10px] md:text-[11px]"
            >
              {t('ENVIAR PARA A JVV STORE', 'SUBMIT TO JVV STORE')}
            </button>

            <div className="relative flex items-center py-1 md:py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">{t('OU', 'OR')}</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <a 
              href={googleReviewLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full py-3.5 md:py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-[11px]"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('AVALIAR NO GOOGLE', 'REVIEW ON GOOGLE')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
