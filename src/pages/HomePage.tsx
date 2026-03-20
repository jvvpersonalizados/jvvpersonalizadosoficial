import React from 'react';
import { Plus } from 'lucide-react';
import { InstagramFeed } from '../components/InstagramFeed';
import { GoogleReviewsMarquee } from '../components/GoogleReviews';
import { getProducts } from '../constants/products';
import { Product } from '../types';

interface HomePageProps {
  navigate: (page: string, data?: any) => void;
  formatPrice: (price: number) => string;
  t: (br: any, int: any) => any;
  addToCart: (p: any, q?: number) => void;
  products?: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, formatPrice, t, addToCart, products: externalProducts }) => {
  const localProducts = getProducts(t);
  const products = externalProducts && externalProducts.length > 0 ? externalProducts : localProducts;
  return (
    <div className="animate-fade font-jakarta">
      <section className="container mx-auto px-4 md:px-6 mb-16 md:mb-24">
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-[30px] md:rounded-[40px] border border-white/5 bg-white/[0.02] shadow-3xl flex items-center justify-center text-center">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7O7Wa-Q6zB6Ki28YBNTOEGN1lhhJElAdYmFXXUlR8WHFkpX8GPFkOhPSdWeG7pEqQhWwb_y4xhf8TnnZWIcB_AMWQCTUF2IPPvk4hK_F-3AxZHi-Msg7oR6b568RKXx3UNQ1J0sl5q64-U3FmiHQm7YTexxArRss4nDfvccNqA00068bUqXT3RXzWTHCK/w640-h350/587093937_1338104444996406_8449863344709963969_n.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" referrerPolicy="no-referrer" />
          <div className="relative z-10 p-6 md:p-8">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none mb-6 md:mb-8 tracking-tighter text-white px-2">{t('Brindes com muito amor!', 'Gifts with lots of love!')}</h2>
            <button onClick={() => navigate('catalog')} className="bg-white text-black font-black uppercase italic px-8 py-4 md:px-12 md:py-5 rounded-full text-[10px] md:text-xs hover:bg-[var(--theme-primary)] hover:text-white transition-all shadow-2xl tracking-[0.2em]">{t('Explorar Coleção', 'Explore Collection')}</button>
          </div>
        </div>
      </section>
      
      <InstagramFeed t={t} />

      <section className="pt-8 md:pt-10 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 md:mb-8 gap-6 text-center md:text-left">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">{t('Experiência dos', 'Experience of')} <span className="text-[var(--theme-primary)]">{t('Exploradores', 'Explorers')}</span></h2>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('O que os clientes falam da JVV Personalizados', 'What customers say about JVV Personalizados')}</p>
            </div>
            <button onClick={() => navigate('reviews')} className="w-full md:w-auto bg-white/5 border border-white/10 px-8 py-3.5 md:py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-[var(--theme-primary)] transition-all">
              {t('VER TODAS AVALIAÇÕES', 'SEE ALL REVIEWS')}
            </button>
          </div>
        </div>
        <GoogleReviewsMarquee t={t} />
      </section>
      
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-10 md:mb-16 tracking-tighter text-white text-center md:text-left">{t('Radar', 'Galactic')} <span className="text-[var(--theme-primary)]">{t('Galáctico', 'Radar')}</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {products.map(p => (
            <div key={p.id} onClick={() => navigate('product', p)} className="bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 rounded-[40px] md:rounded-[50px] group hover:border-[#00d2ff] transition-all cursor-pointer shadow-3xl flex flex-col">
              <div className="bg-white rounded-[25px] md:rounded-[35px] aspect-square flex items-center justify-center p-6 md:p-8 mb-6 md:mb-8 overflow-hidden"><img src={p.img} alt="" className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700" /></div>
              <h3 className="text-base md:text-lg font-black italic uppercase truncate text-slate-300 group-hover:text-white">{p.name}</h3>
              <div className="flex justify-between items-center mt-4 md:mt-6">
                <span className="text-xl md:text-2xl font-black text-white italic">{formatPrice(p.price)}</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--theme-primary)] transition-all text-white shrink-0"><Plus size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
