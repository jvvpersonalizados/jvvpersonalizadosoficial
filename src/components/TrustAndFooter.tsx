import React from 'react';
import { Star, BadgeCheck, Globe, Truck, ShieldCheck, Zap, CreditCard as CardIcon, Bitcoin } from 'lucide-react';

interface TrustAndFooterProps {
  navigate: (page: string) => void;
  t: (br: any, int: any) => any;
  openGlobalInfo: () => void;
}

export const TrustAndFooter: React.FC<TrustAndFooterProps> = ({ navigate, t, openGlobalInfo }) => (
  <footer className="relative z-10 pt-20 md:pt-32 pb-10 md:pb-16 border-t border-white/5 bg-black/40 backdrop-blur-xl mt-20 md:mt-32 text-white font-jakarta">
    <div className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 md:gap-10 mb-12 md:mb-20">
        <div onClick={() => navigate('reviews')} className="w-full md:w-auto flex flex-col items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 md:px-8 md:py-4 rounded-3xl backdrop-blur-md cursor-pointer hover:border-[#d91ebd] transition-all group shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-white">{t('Avaliações do Google', 'Google Reviews')}</span>
          <div className="flex text-yellow-400 gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}</div>
        </div>
        <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-6 py-4 md:px-8 md:py-4 rounded-full backdrop-blur-md font-black shadow-xl">
          <span className="text-xs uppercase text-[#00a859]">{t('Reclame', 'Trust')}</span>
          <span className="text-xs uppercase text-[#0060ac]">{t('Aqui', 'Pilot')}</span>
          <BadgeCheck size={18} className="text-[#0060ac]" fill="currentColor" stroke="white" strokeWidth={1.5} />
        </div>
        <div className="w-full md:flex-1 min-w-[250px] md:min-w-[300px] h-12 md:h-14 bg-white/5 border border-white/10 rounded-full overflow-hidden flex items-center relative">
          <div className="flex whitespace-nowrap animate-ticker px-8 md:px-12 font-medium italic text-[10px] md:text-xs text-white/80">
            {t('"Qualidade orbital, atendimento impecável!" - Cliente VIP JVV', '"Orbital quality, impeccable service!" - VIP Client')}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-24 text-center">
        <div onClick={openGlobalInfo} className="bg-white/5 border border-white/5 rounded-[20px] p-8 md:p-12 backdrop-blur-md group hover:border-purple-500 transition-all cursor-pointer">
          <Globe size={32} className="mx-auto text-blue-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform" />
          <h4 className="font-black italic uppercase text-xs md:text-sm mb-2 md:mb-3 tracking-widest text-white">{t('Envio Global', 'Global Shipping')}</h4>
          <p className="text-slate-500 text-[9px] md:text-[10px] leading-relaxed uppercase font-bold">{t('Entregamos com segurança em toda a galáxia.', 'We deliver safely across the galaxy.')}</p>
        </div>
        <div onClick={openGlobalInfo} className="bg-white/5 border border-white/5 rounded-[20px] p-8 md:p-12 backdrop-blur-md group hover:border-purple-500 transition-all cursor-pointer">
          <Truck size={32} className="mx-auto text-pink-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform" />
          <h4 className="font-black italic uppercase text-xs md:text-sm mb-2 md:mb-3 tracking-widest text-white">{t('Envios Rápidos', 'Fast Shipping')}</h4>
          <p className="text-slate-500 text-[9px] md:text-[10px] leading-relaxed uppercase font-bold">{t('Entrega em tempo recorde orbital.', 'Delivery in record orbital time.')}</p>
        </div>
        <div onClick={openGlobalInfo} className="bg-white/5 border border-white/10 rounded-[20px] p-8 md:p-12 backdrop-blur-md group hover:border-[#d91ebd] transition-all sm:col-span-2 md:col-span-1 cursor-pointer">
          <ShieldCheck size={32} className="mx-auto text-green-400 mb-4 md:mb-6" />
          <h4 className="font-black italic uppercase text-xs md:text-sm mb-2 md:mb-3 tracking-widest text-white">{t('Site Blindado', 'Secured Site')}</h4>
          <p className="text-slate-500 text-[9px] md:text-[10px] leading-relaxed uppercase font-bold">{t('Proteção SSL total para dados seguros.', 'Full SSL protection for secure data.')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 text-slate-400 text-xs mb-12 md:mb-20 text-center md:text-left">
        <div><h5 className="text-pink-500 font-black italic uppercase mb-4 md:mb-6 tracking-widest">{t('Contato', 'Contact')}</h5><div className="space-y-2 md:space-y-3 font-medium"><p>CNPJ: 30.674.888/0001-09</p><p>Barretos - SP, {t('Brasil', 'Brazil')}</p><p className="text-white font-black text-xs md:text-sm mt-3 md:mt-4 tracking-wider">+55 (17) 98127-0724</p><p className="opacity-50 mt-1 md:mt-2">jvvpersonalizados@gmail.com</p></div></div>
        <div><h5 className="text-blue-400 font-black italic uppercase mb-4 md:mb-6 tracking-widest">{t('Pagamento Seguro', 'Secure Payment')}</h5><div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-5 items-center"><div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-white font-bold"><Zap size={14} className="text-[#32b1a4]" /><span className="text-[9px] font-black text-[#32b1a4]">PIX</span></div></div></div>
        <div className="lg:text-right"><h5 className="text-yellow-500 font-black italic uppercase mb-4 md:mb-6 tracking-widest">{t('Segurança Digital', 'Digital Security')}</h5><div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-center md:justify-start gap-4 lg:justify-end"><ShieldCheck className="text-green-500" size={24} /><div className="text-left font-medium text-white"><p className="text-[9px] font-black uppercase">{t('Ambiente 100% Seguro', '100% Secure Environment')}</p><p className="text-[8px] opacity-50 uppercase mt-0.5">{t('Criptografia SSL', 'SSL Encryption')}</p></div></div></div>
      </div>
      <div className="py-8 md:py-10 border-t border-white/5 text-center"><p className="text-[8px] md:text-[10px] font-bold text-gray-700 uppercase tracking-[0.4em] md:tracking-[0.6em] italic">Copyright © 2026 JVV {t('Personalizados', 'Customs')}. {t('Personalizando sonhos desde 2017.', 'Customizing dreams since 2017.')}</p></div>
    </div>
  </footer>
);
