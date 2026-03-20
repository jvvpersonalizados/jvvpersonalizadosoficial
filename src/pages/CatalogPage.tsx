import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../constants/products';
import { Product } from '../types';
import { apiService } from '../services/apiService';

interface CatalogPageProps {
  navigate: (page: string, data?: any, tag?: string) => void;
  selectedTag: string;
  formatPrice: (price: number) => string;
  t: (br: any, int: any) => any;
  addToCart: (p: any, q?: number) => void;
  products?: Product[];
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ navigate, selectedTag, formatPrice, t, addToCart, products: externalProducts }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const localProducts = getProducts(t);
  const products = externalProducts && externalProducts.length > 0 ? externalProducts : localProducts;
  
  const subFiltersMapBR = {
    'Novidades': ['Tudo Novo', 'Mais Vendidos'],
    'Roupas': ['Homem', 'Mulher', 'Criança', 'Menino', 'Menina'],
    'Brindes': ['Copos', 'Canecas', 'Chaveiros', 'Acessórios'],
    'Todos': ['Mais Recentes', 'Menor Preço']
  };

  const subFiltersMapINT = {
    'New': ['All New', 'Best Sellers'],
    'Apparel': ['Men', 'Women', 'Kids', 'Boys', 'Girls'],
    'Gifts': ['Cups', 'Mugs', 'Keychains', 'Accessories'],
    'Todos': ['Latest', 'Lowest Price']
  };

  const mapToUse: any = t(subFiltersMapBR, subFiltersMapINT);
  const currentSubFilters = mapToUse[selectedTag] || mapToUse['Todos'];

  const allProducts = products.filter(p => {
    if (selectedTag === 'Todos' || selectedTag === t('Todos', 'All')) return true;
    return p.category === selectedTag || (selectedTag === t('Brindes', 'Gifts') && (p.category === 'Premium' || p.category === 'Acessórios'));
  });

  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const currentProducts = allProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const changePage = (p: number) => { window.scrollTo({ top: 200, behavior: 'smooth' }); setPage(p); };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 animate-fade text-white font-jakarta">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
        <aside className="lg:w-1/4 space-y-6 md:space-y-10">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-6 md:p-10 rounded-[30px] md:rounded-[50px] shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.6em] mb-6 md:mb-10 text-slate-500 flex items-center gap-4">
              <SlidersHorizontal size={14} className="text-[var(--theme-primary)]" /> {t('FILTRAR', 'FILTER')} {selectedTag.toUpperCase()}
            </h3>
            <div className="flex flex-row overflow-x-auto lg:flex-col gap-3 md:gap-4 font-bold scrollbar-hide pb-2">
              {currentSubFilters.map((cat: string) => (
                <button key={cat} className="whitespace-nowrap w-auto lg:w-full text-left py-3 px-6 md:py-4 md:px-8 rounded-[16px] md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/5 hover:border-[var(--theme-primary)] text-slate-400 hover:text-white transition-all shrink-0">
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white text-center md:text-left">{t('Universo:', 'Universe:')} <br className="md:hidden"/><span className="text-[var(--theme-primary)]">{selectedTag}</span></h2>
            <div className="w-full md:w-80 bg-white/5 border border-white/10 px-5 md:px-6 py-3 md:py-3 rounded-full flex items-center gap-3 md:gap-4 shadow-xl"><Search size={16} className="text-slate-500" /><input type="text" placeholder={t('BUSCAR...', 'SEARCH...')} className="bg-transparent outline-none text-[10px] md:text-xs uppercase w-full text-white" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {currentProducts.map(p => (
              <div key={p.id} onClick={() => navigate('product', p)} className="bg-white/[0.02] border border-white/[0.05] p-4 md:p-5 rounded-[24px] md:rounded-[40px] group hover:border-[#00d2ff] transition-all shadow-xl cursor-pointer">
                <div className="bg-white rounded-[16px] md:rounded-[30px] aspect-square flex items-center justify-center p-3 md:p-4 mb-3 md:mb-4"><img src={p.img} alt="" className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" /></div>
                <h3 className="text-[9px] md:text-[11px] font-bold uppercase truncate text-slate-300">{p.name}</h3>
                <div className="flex justify-between items-center mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-black text-white">{formatPrice(p.price)}</p>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--theme-primary)] text-white shadow-lg shrink-0"><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 md:mt-24 flex items-center justify-center gap-3 md:gap-4">
            <button onClick={() => changePage(Math.max(1, page - 1))} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center transition-all hover:bg-[var(--theme-primary)] ${page === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 shadow-xl'}`}><ChevronLeft size={16} /></button>
            {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => changePage(i + 1)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full text-[9px] md:text-[10px] font-black transition-all border ${page === i + 1 ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] shadow-xl text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>{i + 1}</button>))}
            <button onClick={() => changePage(Math.min(totalPages, page + 1))} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center transition-all hover:bg-[var(--theme-primary)] ${page === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 shadow-xl'}`}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
