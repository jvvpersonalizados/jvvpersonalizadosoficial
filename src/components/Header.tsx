import React, { useState } from 'react';
import { Menu, X, UserCircle, ShoppingCart } from 'lucide-react';
import { OrbitalLogo } from './OrbitalLogo';

interface HeaderProps {
  currentPage: string;
  selectedTag: string;
  navigate: (page: string, data?: any, tag?: string) => void;
  cartCount: number;
  user: any;
  t: (br: any, int: any) => any;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, selectedTag, navigate, cartCount, t }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (page: string, data?: any, tag?: string) => {
    navigate(page, data, tag);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative z-50 pt-6 md:pt-12">
      <div className="container mx-auto px-4 md:px-6 text-white font-jakarta">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8 md:mb-16">
          <OrbitalLogo size={currentPage === 'home' ? "large" : "small"} />
          <div className="text-center md:text-left md:border-l-2 border-white/10 md:pl-8">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">JVV<br className="hidden md:block"/>{t('Personalizados', 'Customs')}</h1>
            <p className="text-[10px] md:text-[12px] font-bold text-purple-500 tracking-[0.2em] uppercase mt-2">{t('Personalizando sonhos desde 2017', 'Customizing dreams since 2017')}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 pb-4 md:pb-8 relative">
          
          {/* Mobile Hamburger Menu Button */}
          <button className="md:hidden p-2 text-white hover:text-[#00d2ff] transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12 text-white">
            <button onClick={() => handleNav('home')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${currentPage === 'home' ? 'text-white font-bold' : 'text-white/60 hover:text-white'}`}>
              {t('Início', 'Home')} {currentPage === 'home' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>}
            </button>
            {[t('Novidades', 'New'), t('Roupas', 'Apparel'), t('Brindes', 'Gifts')].map(tag => (
              <button key={tag} onClick={() => handleNav('catalog', null, tag)} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${(selectedTag === tag && currentPage === 'catalog') ? 'text-white font-bold' : 'text-white/60 hover:text-white'}`}>
              {tag} {(selectedTag === tag && currentPage === 'catalog') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>}
              </button>
            ))}
            <button onClick={() => handleNav('catalog', null, 'Todos')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${(selectedTag === 'Todos' && currentPage === 'catalog') ? 'text-[#00d2ff]' : 'text-[#00d2ff]/60 hover:text-[#00d2ff]'}`}>
              {t('CATÁLOGO', 'CATALOG')}
              {(selectedTag === 'Todos' && currentPage === 'catalog') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00d2ff] shadow-[0_0_100px_#00d2ff]"></span>}
            </button>
          </nav>

          {/* Mobile Navigation Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#020105]/95 backdrop-blur-3xl border border-white/10 rounded-[30px] p-6 flex flex-col gap-4 md:hidden shadow-2xl z-50 animate-fade mt-2">
              <button onClick={() => handleNav('home')} className={`text-[12px] font-black uppercase tracking-widest text-left py-3 px-4 rounded-xl ${currentPage === 'home' ? 'bg-purple-500/20 text-white' : 'text-slate-400'}`}>
                {t('Início', 'Home')}
              </button>
              {[t('Novidades', 'New'), t('Roupas', 'Apparel'), t('Brindes', 'Gifts')].map(tag => (
                <button key={tag} onClick={() => handleNav('catalog', null, tag)} className={`text-[12px] font-black uppercase tracking-widest text-left py-3 px-4 rounded-xl ${(selectedTag === tag && currentPage === 'catalog') ? 'bg-purple-500/20 text-white' : 'text-slate-400'}`}>
                {tag}
                </button>
              ))}
              <button onClick={() => handleNav('catalog', null, 'Todos')} className={`text-[12px] font-black uppercase tracking-widest text-left py-3 px-4 rounded-xl ${(selectedTag === 'Todos' && currentPage === 'catalog') ? 'bg-[#00d2ff]/20 text-[#00d2ff]' : 'text-slate-400'}`}>
                {t('CATÁLOGO', 'CATALOG')}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-6">
            <button onClick={() => handleNav('user')} className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2.5 md:px-6 md:py-3 rounded-full flex items-center gap-2 md:gap-3 hover:bg-white/15 transition-all group">
              <UserCircle size={16} className="text-[#00d2ff]" />
              <span className="hidden sm:inline text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight">{t('MINHA CONTA', 'MY ACCOUNT')}</span>
            </button>
            <button onClick={() => handleNav('checkout')} className="bg-purple-500/10 border border-purple-500/30 px-4 py-2.5 md:px-6 md:py-3 rounded-full flex items-center gap-3 md:gap-4 hover:bg-purple-500/20 transition-all text-white font-bold">
              <div className="relative"><ShoppingCart size={16} /><span className="absolute -top-2 -right-2 md:-right-3 bg-white text-black text-[8px] md:text-[9px] font-black w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center">{cartCount}</span></div>
              <span className="hidden sm:inline text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t('Carrinho', 'Cart')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
