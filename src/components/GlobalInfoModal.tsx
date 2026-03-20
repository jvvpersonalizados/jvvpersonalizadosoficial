import React from 'react';
import { X, Globe, Truck, ShieldCheck, Zap, Shield, MapPin, Phone, Mail, Lock } from 'lucide-react';

interface GlobalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (br: any, int: any) => any;
}

export const GlobalInfoModal: React.FC<GlobalInfoModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4 md:p-6 font-jakarta">
      <div className="bg-[#0a0118] border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-fade relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-widest mb-2">JVV STORE</h2>
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.4em]">{t('Informações de Envio & Segurança', 'Shipping & Security Info')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
              <Globe size={24} className="mx-auto text-blue-400 mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">{t('Envio Global', 'Global Shipping')}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{t('Entregamos com segurança em toda a galáxia.', 'We deliver safely across the galaxy.')}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
              <Truck size={24} className="mx-auto text-pink-400 mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">{t('Envios Rápidos', 'Fast Shipping')}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{t('Entrega em tempo recorde orbital.', 'Delivery in record orbital time.')}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
              <ShieldCheck size={24} className="mx-auto text-green-400 mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">{t('Site Blindado', 'Secured Site')}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{t('Proteção SSL total para dados seguros.', 'Full SSL protection for secure data.')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h5 className="text-purple-500 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Phone size={14} /> {t('Contato', 'Contact')}
                </h5>
                <div className="space-y-3 text-[11px] font-bold text-slate-300">
                  <p className="flex items-center gap-3"><span className="text-white/30 font-black">{t('CNPJ', 'Tax ID')}:</span> 30.674.888/0001-09</p>
                  <p className="flex items-center gap-3"><MapPin size={12} className="text-purple-500" /> {t('Barretos - SP, Brasil', 'Barretos - SP, Brazil')}</p>
                  <p className="flex items-center gap-3 text-white"><Phone size={12} className="text-purple-500" /> +55 (17) 98127-0724</p>
                  <p className="flex items-center gap-3"><Mail size={12} className="text-purple-500" /> jvvpersonalizados@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h5 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Zap size={14} /> {t('Pagamento Seguro', 'Secure Payment')}
                </h5>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#32b1a4]/10 flex items-center justify-center">
                    <Zap size={16} className="text-[#32b1a4]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white">PIX</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">{t('Aprovação Instantânea', 'Instant Approval')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-yellow-500 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Lock size={14} /> {t('Segurança Digital', 'Digital Security')}
                </h5>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                  <ShieldCheck className="text-green-500" size={20} />
                  <div className="font-bold text-white">
                    <p className="text-[10px] font-black uppercase">{t('Ambiente 100% Seguro', '100% Secure Environment')}</p>
                    <p className="text-[8px] text-slate-500 uppercase mt-0.5 tracking-wider">{t('Criptografia SSL', 'SSL Encryption')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">
            JVV STORE • {t('Personalizando sonhos desde 2017', 'Customizing dreams since 2017')}
          </p>
        </div>
      </div>
    </div>
  );
};
