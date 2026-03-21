import React, { useState } from 'react';
import { ChevronRight, Star, ZoomIn, Minus, Plus, CheckCircle, ArrowLeft, Heart, FolderPlus, Check, X } from 'lucide-react';
import { GoogleReviewsMarquee } from '../components/GoogleReviews';
import { getProducts } from '../constants/products';
import { Product, Review } from '../types';
import { apiService } from '../services/apiService';

interface ProductPageProps {
  selectedProduct: Product | null;
  navigate: (page: string, data?: any) => void;
  goBack: () => void;
  addToCart: (p: Product, q?: number, s?: string) => void;
  formatPrice: (price: number) => string;
  t: (br: any, int: any) => any;
  openReviewModal: () => void;
  addedReviews: Review[];
  canReview: (productName: string) => { can: boolean; reason: string };
  user: any;
}

export const ProductPage: React.FC<ProductPageProps> = ({ 
  selectedProduct, navigate, goBack, addToCart, formatPrice, t, 
  openReviewModal, addedReviews, canReview, user 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [zoom, setZoom] = useState({ x: 0, y: 0, active: false });
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Geral');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProduct]);

  const product = selectedProduct || { name: "Copo Térmico JVV Pro", price: 89.90, img: "https://images.tcdn.com.br/img/img_prod/1114972/copo_termico_personalizado_azul_marinho_com_tampa_e_abridor_359_1_092e078be993043d0e2e2ca1ec41e2e2.jpg" };
  const productImages = [product.img, "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=800&q=80", "https://images.unsplash.com/photo-1581009146145-b5ef03a94e77?w=800&q=80"];

  const baseProductReviews: Review[] = [
    { id: 101, name: "Lucas M.", date: t("1 semana atrás", "1 week ago"), rating: 5, text: t("Comprei este item e a qualidade é surreal. A gravação ficou exatamente como eu pedi.", "Bought this item and the quality is surreal. The engraving is exactly as I requested.") },
    { id: 102, name: "Mariana S.", date: t("3 semanas atrás", "3 weeks ago"), rating: 5, text: t("Chegou super rápido e muito bem embalado. Produto top de linha.", "Arrived super fast and very well packaged. Top of the line product.") }
  ];

  const productReviews = [...(addedReviews || []), ...baseProductReviews];
  
  const totalRating = productReviews.reduce((acc, rev) => acc + rev.rating, 0);
  const averageRating = productReviews.length > 0 ? (totalRating / productReviews.length).toFixed(1) : "5.0";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoom({ x, y, active: true });
  };

  const products = getProducts(t);
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    if (product.type === 'clothing' && !selectedSize) {
      alert(t("Por favor, selecione um tamanho.", "Please select a size."));
      return;
    }
    addToCart(product, quantity, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSaveFavorite = async () => {
    if (!user) {
      alert(t("Faça login para salvar favoritos!", "Log in to save favorites!"));
      navigate('user');
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiService.addFavorite(user.email, product.id || product.name, selectedFolder);
      if (res.success) {
        setSaved(true);
        setShowFolderSelect(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyNow = () => {
    if (product.type === 'clothing' && !selectedSize) {
      alert(t("Por favor, selecione um tamanho.", "Please select a size."));
      return;
    }
    addToCart(product, quantity, selectedSize);
    navigate('checkout');
  };

  const handleOpenReview = () => {
    const check = canReview(product.name);
    if (check.can) {
      openReviewModal();
    } else {
      if (check.reason === 'login') {
        alert(t("Você precisa entrar na sua conta para avaliar este produto.", "You need to log in to your account to review this product."));
        navigate('user');
      } else {
        alert(t("Apenas clientes que compraram este produto podem avaliá-lo.", "Only customers who bought this product can review it."));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade font-jakarta">
      <div className="flex flex-wrap items-center justify-between mb-8 md:mb-12 gap-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
          <button onClick={() => navigate('home')} translate="no" className="hover:text-white transition-colors">{t('Início', 'Home')}</button>
          <ChevronRight size={10} />
          <button onClick={() => navigate('catalog')} className="hover:text-white transition-colors">{t('Catálogo', 'Catalog')}</button>
          <ChevronRight size={10} />
          <span className="text-[var(--theme-primary)] truncate max-w-[150px] md:max-w-none">{product.name}</span>
        </div>
        
        <button 
          onClick={goBack} 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={14} />
          {t('Voltar', 'Back')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start">
        <div className="space-y-4 md:space-y-6">
          <div 
            className="bg-white/[0.03] rounded-[40px] md:rounded-[60px] h-[300px] md:h-auto md:aspect-square flex items-center justify-center overflow-hidden relative cursor-zoom-in group border border-white/10 shadow-3xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom({ ...zoom, active: false })}
          >
            <img 
              src={productImages[activeImg]} 
              alt="" 
              className={`max-h-full transition-transform duration-300 ${zoom.active ? 'scale-[2.5]' : 'scale-100'}`} 
              style={zoom.active ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}}
            />
            {!zoom.active && <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={18}/></div>}
          </div>
          <div className="flex gap-3 md:gap-4 justify-center overflow-x-auto pb-2 scrollbar-hide">
            {productImages.map((img, idx) => (<button key={idx} onClick={() => setActiveImg(idx)} className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border-2 transition-all p-2 bg-white/5 overflow-hidden shrink-0 ${activeImg === idx ? 'border-[var(--theme-primary)] bg-white/10 scale-105' : 'border-white/5 hover:border-white/20'}`}><img src={img} className="w-full h-full object-contain" alt="" /></button>))}
          </div>
        </div>
        
        <div className="space-y-8 md:space-y-10 py-6 md:py-10">
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-wrap items-center gap-3 md:gap-4"><span className="bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-1.5 rounded-full uppercase tracking-widest">Premium JVV</span><div className="flex items-center gap-1 text-yellow-500">{[1,2,3,4,5].map(i => <Star key={i} size={10} className="md:w-3 md:h-3" fill="currentColor" />)}<span className="text-slate-500 text-[9px] md:text-[10px] ml-1 md:ml-2 font-bold">{t(`(${productReviews.length + 46} Avaliações)`, `(${productReviews.length + 46} Reviews)`)}</span></div></div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-tight tracking-tighter">{product.name}</h1>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-3 md:gap-4"><span className="text-slate-600 line-through text-lg md:text-xl font-bold italic">{formatPrice(product.price * 1.4)}</span><span className="bg-[#00ff88]/10 text-[#00ff88] text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1 rounded-md uppercase tracking-wider">35% OFF</span></div>
            <p className="text-4xl md:text-5xl font-black text-[#00ff88]">{formatPrice(product.price)}</p>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest">{t('ou 12x de', 'or 12x of')} {formatPrice(product.price / 12)} {t('sem juros', 'interest-free')}</p>
          </div>
          <p className="text-slate-400 text-sm md:text-lg italic leading-relaxed">{t('Alta fidelidade na personalização, material premium e durabilidade stelar única JVV Store.', 'High fidelity customization, premium material and unique stellar durability by JVV Store.')}</p>
          
          <div className="space-y-6 md:space-y-8 pt-2 md:pt-4">
            {product.type === 'clothing' && product.sizes && (
              <div className="space-y-4">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{t('Tamanho:', 'Size:')}</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black italic transition-all border ${selectedSize === size ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-[0_0_20px_rgba(var(--theme-primary),0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 text-white"><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{t('Quantidade:', 'Quantity:')}</span><div className="flex items-center bg-white/5 border border-white/10 rounded-[12px] md:rounded-2xl p-1 text-white"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Minus size={14}/></button><span className="w-10 md:w-12 text-center text-base md:text-lg font-black italic">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Plus size={14}/></button></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <button onClick={handleBuyNow} className="w-full py-5 md:py-7 bg-gradient-to-br from-[#00ff88] to-[#00a859] text-black font-black uppercase italic rounded-full shadow-2xl hover:scale-[1.03] active:scale-95 transition-all tracking-widest text-xs">{t('COMPRAR AGORA', 'BUY NOW')}</button>
              <button onClick={handleAdd} className={`w-full py-5 md:py-7 font-black uppercase italic rounded-full transition-all tracking-widest text-[10px] md:text-xs ${added ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                {added ? t('✓ ADICIONADO', '✓ ADDED') : t('ADICIONAR AO CARRINHO', 'ADD TO CART')}
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowFolderSelect(!showFolderSelect)}
                className={`w-full py-4 md:py-5 flex items-center justify-center gap-3 font-black uppercase italic rounded-full transition-all tracking-widest text-[9px] md:text-[10px] border ${saved ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <Heart size={16} className={saved ? 'fill-rose-500' : ''} />
                {saved ? t('SALVO NOS FAVORITOS', 'SAVED TO FAVORITES') : t('SALVAR ONLINE', 'SAVE ONLINE')}
              </button>

              {showFolderSelect && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-3xl z-50 animate-fade">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('Escolher Pasta:', 'Choose Folder:')}</span>
                    <button onClick={() => setShowFolderSelect(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                  </div>
                  <div className="space-y-2 mb-6">
                    {['Geral', 'Desejos', 'Presentes', 'Projetos'].map(folder => (
                      <button 
                        key={folder}
                        onClick={() => setSelectedFolder(folder)}
                        className={`w-full p-3 rounded-xl text-left text-[10px] font-bold uppercase tracking-widest transition-all ${selectedFolder === folder ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {folder}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleSaveFavorite}
                    disabled={isSaving}
                    className="w-full py-4 bg-[#00ff88] text-black font-black uppercase italic rounded-xl text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <Check size={16}/>}
                    {t('CONFIRMAR SALVAMENTO', 'CONFIRM SAVE')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 md:mt-32 pt-16 md:pt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-6 text-center md:text-left">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">{t('Radar de', 'Product')} <span className="text-[#00d2ff]">{t('Produtos', 'Radar')}</span></h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Exploradores que compraram este item também levaram', 'Explorers who bought this also bought')}</p>
          </div>
          <button onClick={() => navigate('catalog')} className="text-[10px] font-black uppercase tracking-widest text-white hover:text-[#00d2ff] transition-all flex items-center gap-2">
            {t('Ver mais', 'See more')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {relatedProducts.map(p => (
            <div key={p.id} onClick={() => navigate('product', p)} className="bg-white/[0.02] border border-white/[0.05] p-4 md:p-5 rounded-[24px] md:rounded-[30px] group hover:border-[#00d2ff] transition-all shadow-xl cursor-pointer flex flex-col">
              <div className="bg-white rounded-[16px] md:rounded-[20px] aspect-square flex items-center justify-center p-3 md:p-4 mb-3 md:mb-4"><img src={p.img} alt="" className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" /></div>
              <h3 className="text-[9px] md:text-[11px] font-bold uppercase truncate text-slate-300">{p.name}</h3>
              <div className="flex justify-between items-center mt-auto pt-3 md:pt-4">
                <p className="text-xs md:text-sm font-black text-white">{formatPrice(p.price)}</p>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00d2ff] hover:text-black text-white shadow-lg shrink-0 transition-all"><Plus size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-16 md:pt-20 border-t border-white/5">
        <div className="flex flex-col justify-between items-center md:items-end mb-10 md:mb-16 gap-6 md:flex-row text-center md:text-left">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">{t('Avaliações do', 'Reviews for')} <span className="text-[var(--theme-primary)]">{t('Produto', 'Product')}</span></h2>
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-black text-white">{averageRating}</span>
              <div className="flex text-yellow-400"><Star size={16} className="md:w-5 md:h-5" fill="currentColor" /><Star size={16} className="md:w-5 md:h-5" fill="currentColor" /><Star size={16} className="md:w-5 md:h-5" fill="currentColor" /><Star size={16} className="md:w-5 md:h-5" fill="currentColor" /><Star size={16} className="md:w-5 md:h-5" fill="currentColor" /></div>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t(`Baseado em ${productReviews.length + 46} avaliações`, `Based on ${productReviews.length + 46} reviews`)}</span>
              {canReview(product.name).can && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-1">
                  <CheckCircle size={10} /> {t('Compra Verificada', 'Verified Purchase')}
                </span>
              )}
            </div>
          </div>
          <button onClick={handleOpenReview} className="w-full md:w-auto bg-[var(--theme-primary)] text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--theme-primary)]/80 transition-all shadow-[0_0_20px_rgba(var(--theme-primary),0.3)]">
            {t('ESCREVER AVALIAÇÃO', 'WRITE A REVIEW')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
          {productReviews.map(r => (
            <div key={r.id} className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-2xl hover:border-[var(--theme-primary)]/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-center mb-5 md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#00d2ff] to-[var(--theme-primary)] rounded-full flex items-center justify-center font-black text-white text-base md:text-lg">{r.name.charAt(0)}</div>
                  <div>
                    <h4 className="font-bold text-white text-sm md:text-base">{r.name}</h4>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{r.date}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />)}
                </div>
              </div>
              <p className="text-slate-300 italic leading-relaxed text-xs md:text-sm flex-1">"{r.text}"</p>
              
              {r.photo && (
                <div className="mt-5 md:mt-6 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 h-40 md:h-48 w-full">
                  <img src={r.photo} alt="Avaliação do Cliente" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="mt-5 md:mt-6 inline-flex items-center gap-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 px-3 py-1.5 rounded-full text-[8px] text-[#00ff88] font-black uppercase tracking-widest w-fit">
                <CheckCircle size={10} /> {t('Compra Verificada', 'Verified Purchase')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-16 md:pt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 md:mb-8 gap-6 text-center md:text-left">
          <div className="space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">{t('Experiência dos', 'Experience of')} <span className="text-[var(--theme-primary)]">{t('Exploradores', 'Explorers')}</span></h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('O que os clientes falam da JVV Personalizados', 'What customers say about JVV Personalizados')}</p>
          </div>
          <button onClick={() => navigate('reviews')} className="w-full md:w-auto bg-white/5 border border-white/10 px-8 py-3.5 md:py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-[var(--theme-primary)] transition-all">
            {t('VER TODAS AVALIAÇÕES', 'SEE ALL REVIEWS')}
          </button>
        </div>
        <GoogleReviewsMarquee t={t} />
      </div>
    </div>
  );
};
